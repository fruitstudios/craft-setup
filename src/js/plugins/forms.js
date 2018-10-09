app.forms = (function () {

    'use strict';

	var _api = {};

    // Private Variables
    // =========================================================================

	var _settings;
	var _forms = {};
	var _delay = null;
	var _stripe;

    // Defaults Variables
    // =========================================================================

	var defaults = {
		selector: '[data-form]',
		uidAttribute: 'data-form-id',
		form: {
			ajax: true,
			redirect: false,
			toast: false,
			toastSuccessMessage: false,
			showSuccessBlock: false,
			disableSubmit: false,
			formErrors: false,
			fieldErrors: false,
			highlightFieldErrors: false,
			offset: 20,
			confirm: false,
			onSubmit: function(form) {
				// console.log('onSubmit', form);
			},
			onSuccess: function(form, response) {
				// console.log('onSuccess', form, response);
			},
			onError: function(form, response) {
				// console.log('onError', form, response);
			},
			onFail: function(form, response) {
				// console.log('onFail', form, response);
			},
			onAlways: function(form, response) {
				// console.log('onAlways', form, response);
			},
			selectors: {
				formWrapper: '[data-form-wrapper]',
				formErrors: '[data-form-errors]',
				field: '[data-form-field]',
				fieldRow: '[data-table-row], [data-matrix-block]', // for table fields and matrix fields with child fields
				submitWrapper: '[data-form-submit]',
				fieldError: '[data-form-field-error]',
				paymentField: '[data-payment-field]',
				paymentCard: '[data-payment-field-card]',
				successBlock: '[data-form-success-block]',
			},
			hasErrorsClass: 'has-errors',
			hasErrorClass: 'has-error',
			fieldErrorClass: 'field-error',
			submittingClass: 'has-spinner',
			templates: {
				fieldError: function (form, error) {
					return '<p class="' + form.settings.fieldErrorClass + '" data-form-field-error>' + error + '</p>';
				}
			}
		},
	};

	// Private Methods
    // =========================================================================

	// Event Handlers
    // =========================================================================

    var submitHandler = function (event) {

        var formElement = event.target.closest(_settings.selector);
        if (!formElement) return;

	    var form = _api.getForm(formElement);
		if(!form) return;

		if(form.settings.ajax) {
			event.preventDefault();
		}

    	_api.submit(form);
    };

    var resetHandler = function (event) {

        var reset = event.target.closest('[data-form-reset]');
        if (!reset) return;

        event.preventDefault();

        var formElement = reset.closest(_settings.selector);
        if (!formElement) return;

    	_api.reset(formElement);
    };

	var valueChangeHandler = function (event) {

		if (!event.target.form || !event.target.form.matches(_settings.selector)) return;

	    var form = _api.getForm(event.target.form);
		if(!form) return;

		clearTimeout(_delay);

		if(event.type === 'change') {
			_api.canSubmit(form);
		} else {
			_delay = setTimeout(function () {
				_api.canSubmit(form);
			}, 250);
		}
	};


	// Api Methods
    // =========================================================================

	_api.getForm = function (formReference) {

		if(_.isString(formReference)) {
			return _forms[formReference] || false;
		}

		if(_.isElement(formReference) && formReference.hasAttribute(_settings.uidAttribute)) {
    		return _api.getForm(formReference.getAttribute(_settings.uidAttribute));
    	}

        if(_.isPlainObject(formReference)) {
        	return formReference;
        }

        return false;
	}

	_api.reset = function (form) {

		var form = _api.getForm(form);
		if(!form) return;

		var newFormElement = app.utils.clonedNodeToElement(form.dom.orginalForm);
		_api.create(newFormElement, form.settings);

		form.dom.form.parentNode.replaceChild(newFormElement, form.dom.form);
	}

	_api.resetAllForms = function (context) {

        var forms = (context || document).querySelectorAll('[data-form-id]');
        forms.forEach(function (form, index) {
            _api.reset(form);
        });
	}

	var handlePaymentFields = function (form) {

		var form = _api.getForm(form);
		if(!form) return;

        event.preventDefault();

        var cardData = {};

        _stripe.createToken(form.payments.card, cardData).then(function(result) {

            if (result.error) {
            	_api.addFormError(form, result.error);
            } else {
            	var stripeToken = form.dom.form.querySelector('input[name="stripeToken"]');
            	if(stripeToken) {
					stripeToken.setAttribute('value', result.token.id);
            	} else {
            		var hiddenInput = document.createElement('input');
	                hiddenInput.setAttribute('type', 'hidden');
	                hiddenInput.setAttribute('name', 'stripeToken');
	                hiddenInput.setAttribute('value', result.token.id);
	                form.dom.form.appendChild(hiddenInput);
            	}
                _api.submit(form);
            }

            form.dom.submitWrapper.classList.remove(form.settings.submittingClass);
			_api.canSubmit(form);

        });

	}

	_api.submit = function (form) {

		var form = _api.getForm(form);
		if(!form) return;

		if(form.settings.confirm) {
			var confirmation = confirm(form.settings.confirm);
			if (!confirmation) {
				e.stopPropagation();
				return;
			}
		}

		// Disable submit button
		form.dom.submitWrapper.classList.add(form.settings.submittingClass);
		_api.disableSubmit(form);

		// Trigger onSubmit()
		form.settings.onSubmit(form);
		_api.clearFormErrors(form);

		// Payment fields
		if(form.payments) {
			var stripeToken = form.dom.form.querySelector('input[name="stripeToken"]');
			if(!stripeToken) {
				handlePaymentFields(form);
				return;
			}
		}

		// Ajax request
		if(form.settings.ajax) {

			atomic.ajax({
				type: 'POST',
				data: app.utils.serialize(form.dom.form),
				url: '/',
				headers: {
					'Accept': 'application/json',
					'X-Requested-With': 'XMLHttpRequest',
				},
				responseType: 'json',
			})
			.success(function (responseText, xhr) {

				var response = xhr.response;

				if(response.error || response.errors || !response.success) {

					if(response.error) {
						_api.addFormError(form, response.error);
					}

					if(response.errors) {
						_api.addFormErrors(form, response.errors);
					}

					if(response.message) {
						app.toasts.create({
							type: 'error',
							dismissable: true,
							message: response.message,
						});
					}

					// Focus on form errors or highest field error
					var scrollTo = false;
					if(form.settings.formErrors) {

						if(app.utils.isOutOfViewport(form.dom.formErrors).any) {
							var position = app.utils.getPosition(form.dom.formErrors);
							scrollTo = position.top;
						}


					} else if (response.errors && (form.settings.fieldErrors || form.settings.highlightFieldErrors)) {

						var firstError = form.dom.form.querySelector('.' + form.settings.hasErrorClass);
						if(firstError) {
							if(app.utils.isOutOfViewport(firstError).any) {
								var position = app.utils.getPosition(firstError);
								scrollTo = position.top;
							}
						}
					}

					if(scrollTo) {
						window.scrollTo({
						    top: scrollTo - form.settings.offset,
						    behavior: "smooth"
						});
					}

					// Trigger onError()
					form.settings.onError(form, response);

					return;
				}

				// Setup toast
				var toast = null;
				if (form.settings.toast || form.settings.toastSuccessMessage) {
					toast = {
						type: 'success',
						dismissable: true,
						message: form.settings.toastSuccessMessage ? form.settings.toastSuccessMessage : ( response.message || 'Success')
					};
				}

				// Trigger onSuccess()
				form.settings.onSuccess(form, response);

				// Success block / redirect
				if (form.settings.showSuccessBlock && form.dom.successBlock) {

					form.dom.successBlock.classList.remove('hidden');
					form.dom.formWrapper.classList.add('hidden');

				} else if (form.settings.redirect) {
					app.utils.reload({
						url: response.redirect || null,
						toast: toast
					});
					return
				}

				if(toast) {
					app.toasts.create(toast);
				}
			})
			.error(function (responseText, xhr) {

				// Trigger onFail()
				form.settings.onFail(form, xhr);

			})
			.always(function (responseText, xhr) {

				form.dom.submitWrapper.classList.remove(form.settings.submittingClass);
				_api.canSubmit(form);

				// Trigger onAlways()
				form.settings.onAlways(form, xhr);

			});
		}

	}

	_api.addFormError = function (form, error) {

		var form = _api.getForm(form);
		if(!form) return;

		form.dom.formErrors.innerHTML = '<ul><li>' + error + '</li></ul>';
		form.dom.form.classList.add(form.settings.hasErrorsClass);

	}

	_api.addFormErrors = function (form, errors) {

		var form = _api.getForm(form);
		if(!form) return;

		// Collate form errors (could be string or array)
		var errorArray = [];
		Object.keys(errors).forEach(function (handle) {

			var regex = /(.+)\[([0-9]+)\]\.(.+)/;
			var matches = handle.match(regex);

			var errorObject = {};

			if(matches != null) {
				errorObject['parent'] = matches[1];
				errorObject['row'] = parseInt(matches[2]);
				errorObject['handle'] = matches[3];
			} else {
				errorObject['handle'] = handle;
			}

			if(_.isString(errors[handle])) {

				errorObject['message'] = errors[handle];
				errorArray.push(errorObject);

			} else {

				errors[handle].forEach(function(error, i) {

					errorObject['message'] = error;
					errorArray.push(errorObject);

				});
			}
		});

		// Process all errors
		var errorList = '';
		errorArray.forEach(function(error, i) {

			_api.addFieldError(form, error);
			errorList += '<li>' + error.message + '</li>';

		});

		if(form.settings.formErrors) {
			form.dom.formErrors.innerHTML = '<ul>' + errorList + '</ul>';
		}

		form.dom.form.classList.add(form.settings.hasErrorsClass);
	}

	_api.addFieldError = function (form, error, field) {

		var form = _api.getForm(form);
		if(!form) return;

		var message = '';
		var elementForErrors;

		if(_.isObject(error)) {

			var field = getFieldHolder(form, error);
			if(!field) return;

			message = error.message;

			if(error.hasOwnProperty('parent')) {
				elementForErrors = field.closest(form.settings.selectors.fieldRow);
			} else {
				elementForErrors = field;
			}
		}

		if(_.isString(error)) {
			if(!field) return;
			elementForErrors = field;
			message = error;
		}

		field.classList.add(form.settings.hasErrorClass);

		if(form.settings.fieldErrors) {
			var errorMessageTempate = form.settings.templates.fieldError;
			var html = _.isFunction(errorMessageTempate) ? errorMessageTempate(form, message) : errorMessageTempate;
			var message = app.utils.renderAsElement(html);
			if(message && elementForErrors) {
				elementForErrors.append(message);
			}
		}
	}

	_api.removeFieldErrors = function (form, field) {

		var form = _api.getForm(form);
		if(!form || !field) return;

		field.classList.remove(form.settings.hasErrorClass);

		var fieldErrors = field.querySelectorAll(form.settings.selectors.fieldError);
		if(fieldErrors) {
			fieldErrors.forEach(function(message, i) {
				message.remove();
			});
		}
	}

	_api.clearFormErrors = function (form) {

		var form = _api.getForm(form);
		if(!form) return;

		// Remove any form errors
		form.dom.formErrors.innerHTML = '';
		form.dom.form.classList.remove(form.settings.hasErrorsClass);

		// Remove error messages
		var fieldErrors = form.dom.form.querySelectorAll(form.settings.selectors.fieldError);
		if(fieldErrors) {
			fieldErrors.forEach(function(message, i) {
				message.remove();
			});
		}

		// Remove error class
		var fieldsWithErrorClass = form.dom.form.querySelectorAll('.' + form.settings.hasErrorClass);
		if(fieldsWithErrorClass) {
			fieldsWithErrorClass.forEach(function(field, i) {
				field.classList.remove(form.settings.hasErrorClass);
			});
		}
	}

	_api.enableSubmit = function (form) {

		var form = _api.getForm(form);
		if(!form) return;

		if(form.dom.submit) {
			form.dom.submit.removeAttribute('disabled');
		}
	}

	_api.disableSubmit = function (form) {

		var form = _api.getForm(form);
		if(!form) return;

		if(form.dom.submit) {
			form.dom.submit.setAttribute('disabled', true);
		}

	}

	_api.canSubmit = function (form) {

		var form = _api.getForm(form);
		if(!form) return;

		if(form.settings.disableSubmit) {

			// Any required fields without a value
			var emptyRequiredFields = false;
			if(form.dom.fields.length) {
				for (var i = 0; i < form.dom.fields.length; i++) {
					var field = form.dom.fields[i];
					if(field.validity.valueMissing) {
						emptyRequiredFields = true;
						break;
					}
				}
				if(emptyRequiredFields) {
					_api.disableSubmit(form);
					return;
				}
			}
		}

		_api.enableSubmit(form);
	}


    var getFieldHolder = function (form, params) {

		var form = _api.getForm(form);
		if(!form) return false;

		var isChildFieldError = params.hasOwnProperty('parent');
		var name = isChildFieldError ? params.parent : params.handle;

		var field = getField(form.dom.form, name);
	    if(field && isChildFieldError) {
	    	var fieldRows = field.querySelectorAll(form.settings.selectors.fieldRow);
	    	var fieldRow = fieldRows.length > 0 ? fieldRows[params.row] : false;
			field = fieldRow ? getField(fieldRow, params.handle) : false;
	    }
	    if(!field) return false;

        var holder = field.closest(form.settings.selectors.field);
        if(!holder) return false;

        return holder;
	}

	var getField = function (context, name) {

		if(!context) return;
		return context.querySelector([
			'[name="'+name+'"]',
            '[name="'+name+'[]"]',
            '[name="fields['+name+']"]',
            '[name="fields['+name+'][]"]',
            '[name*="[fields]['+name+']"]',
            '[name*="[fields]['+name+'][]"]',
            '[data-form-field="'+name+'"]',
			'[data-form-field="'+name+'[]"]',
			'[data-form-field="fields['+name+']"]',
			'[data-form-field="fields['+name+'][]"]',
			'[data-form-field*="[fields]['+name+']"]',
			'[data-form-field*="[fields]['+name+'][]"]',
        ].join(', '));
	}

	var getFormFields = function ( formElement, options ) {

		var settings = _.defaults((options || {}), defaults.form);

		var elements = formElement.elements;
		var fields = [];
		if(elements.length)
		{
			for (var i = 0; i < elements.length; i++) {
				if(elements[i].type !== 'reset' && elements[i].type !== 'submit' && elements[i].type !== 'button' && elements[i].type !== 'hidden') {
					fields.push(elements[i]);
				}
			}
		}

		return fields;
	}

	var initPaymentField = function(form, field) {

		var form = _api.getForm(form);
		if(!_stripe || !form) return false;

        var cardHolder = field.querySelector(form.settings.selectors.paymentCard);
        if(!cardHolder) return;

        var fieldHolder = field.closest(form.settings.selectors.field);
        if(!fieldHolder) return false;

        var elements = _stripe.elements({
            locale: 'auto',
        });

        var card = elements.create('card', {
            hidePostalCode: false
        });

        card.mount(cardHolder);

        card.addEventListener('change', function(event) {
			_api.removeFieldErrors(form, fieldHolder);
			if(typeof event.error != 'undefined') {
             	_api.addFieldError(form, event.error.message, fieldHolder);
            }
        });

        return card;

    };

	_api.create = function ( formElement, options ) {

		var settings = _.defaults(app.utils.getOptionsFromElement(formElement), (options || {}), defaults.form);
		var uid = app.utils.getUid(10, 'form');

		// Form errors block
		var formErrors = formElement.querySelector(settings.selectors.formErrors);

		// Form success block
		var successBlock = formElement.querySelector(settings.selectors.successBlock);

		// Form wrapper
		var formWrapper = formElement.querySelector(settings.selectors.formWrapper);

		// Get all fields
		var fields = getFormFields( formElement, settings );

		// Get the submit
		var submitWrapper = formElement.querySelector(settings.selectors.submitWrapper);
		var submit = formElement.querySelector('input[type="submit"]');

		// Store form for later
		var form = {
			uid: uid,
			payments: null,
			settings: settings,
			dom: {
				form: formElement,
				orginalForm: formElement.cloneNode(true),
				formWrapper: formWrapper,
				fields: fields,
				submitWrapper: submitWrapper,
				submit: submit,
				formErrors: formErrors,
				successBlock: successBlock
			},
			fields: fields,
		};
		_forms[uid] = form;

		// Payment fields
		var paymentField = formElement.querySelector(settings.selectors.paymentField);
		if(_stripe && paymentField) {
			_forms[uid].payments = {};
			_forms[uid].payments.card = initPaymentField(form, paymentField);
		}

		// Setup the form
		form.dom.form.setAttribute(_settings.uidAttribute, uid);
		form.dom.form.setAttribute('novalidate', true);
		form.dom.form.setAttribute('data-form', '');

		// Submit Setup
		_api.canSubmit(form);
	};

	// Init & Destroy
    // =========================================================================

	_api.destroy = function () {
		if ( !_settings && !_forms ) return;
		document.removeEventListener('submit', submitHandler, false);
		document.removeEventListener('change', valueChangeHandler, true);
		document.removeEventListener('input', valueChangeHandler, true);
		_settings = null;
		_forms = {};
	};

	_api.init = function (options) {

		if(typeof Stripe != 'undefined') {
			_stripe = Stripe(app.settings.stripe.publishableKey);
		}

		_api.destroy();

		// Merge user options with defaults
		_settings = _.defaults((options || {}), defaults);

		// Setup basic forms
        var forms = document.querySelectorAll(_settings.selector);
        if(forms.length) {
			forms.forEach(function(form, i) {

				var formSettings = _.defaults({
					redirect: true,
					fieldErrors: true,
					highlightFieldErrors: true,
				}, _settings.form);

				_api.create(form, formSettings);

			});
		}

		document.addEventListener('submit', submitHandler, false);
		document.addEventListener('click', resetHandler, false);
		document.addEventListener('change', valueChangeHandler, true);
		document.addEventListener('input', valueChangeHandler, true);


	};

    // Public Api
    // =========================================================================

    return _api;

})();


