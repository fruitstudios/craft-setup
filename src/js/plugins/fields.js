app.fields = (function () {

    'use strict';

    // Default Variables
    // =========================================================================

    var selectors = {
        datePicker: '[data-datepicker]',
        dateSelect: '[data-dateselect]',
        dataSelect: '[data-dataselect]',
        matrix: '[data-matrix]',
    };

    var defaults = {
        // https://github.com/flatpickr/flatpickr/blob/master/src/types/options.ts
        datePicker: {
            dateFormat: 'Y-m-d 07:00:00',
            enableTime: false,
            minDate: "today",
            altInput: true,
            altFormat: 'J M Y',
            shorthandCurrentMonth: true,
            mode: 'single',
        },
        dateSelect: {
            numberOfYears: 100,
            endYear: null,
        },
        // https://github.com/jshjohnson/Choices#setup
        dataSelect: {
            removeItemButton: true,
            placeholder: false,
            maxItemCount: -1,
            renderChoiceLimit: -1,
            searchEnabled: true,
        },
        matrix: {

        }
    };


    // Variables
    // =========================================================================

    var _api = {};

    // Date Picker (Flatpickr)
    // =========================================================================

    var initDatePicker = function (input, options) {
        var settings = _.defaults(app.utils.getOptionsFromElement(input), options, defaults.datePicker.options);
        if(settings.mode == 'range') {
            var holder = input.parentNode;
            var fromInput = holder.querySelector('[data-date-from]');
            var toInput = holder.querySelector('[data-date-to]');
            settings.onChange = function(selectedDates, dateStr, instance) {
                var from = selectedDates[0] || false;
                var to = selectedDates[1] || false;
                fromInput.value = from && from != '' ? instance.formatDate(from, instance.config.dateFormat) : '';
                toInput.value = to && to != '' ? instance.formatDate(to, instance.config.dateFormat) : '';
            };
        }
        new flatpickr(input, settings);
    };

    // Date Select (HTML Selects)
    // =========================================================================

    var initDateSelect = function (field, options) {

        var settings = _.defaults(app.utils.getOptionsFromElement(field), options, defaults.dateSelect.options);

        // TODO: Replace end year with minDate / maxDate settings
        var endYear = settings.endYear ? settings.endYear : (new Date()).getFullYear();

        var dateInput = field.querySelector('[data-input]');

        var yearSelect = field.querySelector('[data-year]');
        var monthSelect = field.querySelector('[data-month]');
        var daySelect = field.querySelector('[data-day]');

        var activeYearSelection = yearSelect.getAttribute('data-year');
        var activeMonthSelection = monthSelect.getAttribute('data-month');
        var activeDaySelection = daySelect.getAttribute('data-day');

        var populateDays = function(month) {

            // delete the current set of <option> elements out of the
            // day <select>, ready for the next set to be injected
            while(daySelect.firstChild){
                daySelect.removeChild(daySelect.firstChild);
            }

            // Create variable to hold new number of days to inject
            var dayNum;

            // 31 or 30 days?
            if(month === 'January' || month === 'March' || month === 'May' || month === 'July' || month === 'August' || month === 'October' || month === 'December') {
                dayNum = 31;
            } else if(month === 'April' || month === 'June' || month === 'September' || month === 'November') {
                dayNum = 30;
            } else {
                // If month is February, calculate whether it is a leap year or not
                var year = yearSelect.value;
                (year - 2016) % 4 === 0 ? dayNum = 29 : dayNum = 28;
            }

            // inject the right number of new <option> elements into the day <select>
            for(var i = 1; i <= dayNum; i++) {
                var option = document.createElement('option');
                option.textContent = i;
                daySelect.appendChild(option);
            }

            // if day has already been set, set daySelect's value
            // to that day, to avoid the day jumping back to 1 when you
            // change the year
            if(activeDaySelection) {
                daySelect.value = activeDaySelection;

                // If the previous day was set to a high number, say 31, and then
                // you chose a month with less total days in it (e.g. February),
                // this part of the code ensures that the highest day available
                // is selected, rather than showing a blank daySelect
                if(daySelect.value === "") {
                    daySelect.value = activeDaySelection - 1;
                }

                if(daySelect.value === "") {
                    daySelect.value = activeDaySelection - 2;
                }

                if(daySelect.value === "") {
                    daySelect.value = activeDaySelection - 3;
                }
            }

        }

        var populateYears = function() {
            // get active year and clear attr value
            var selectedYear = yearSelect.getAttribute('data-year');
            yearSelect.setAttribute('data-year', '');

            // Make this year, and the 100 years before it available in the year <select>
            for(var i = 0; i <= settings.numberOfYears; i++) {
                var option = document.createElement('option');
                option.textContent = endYear-i;
                yearSelect.appendChild(option);
            }
            if(activeYearSelection != '') {
                yearSelect.value = activeYearSelection;
            }
        }

        var updateInput = function() {

            var day = daySelect.value;
            var month = new Date(Date.parse(monthSelect.value +" 1, 2012")).getMonth()+1;
            var year = yearSelect.value;

            dateInput.value = year.toString() + '-' + month.toString().padStart(2, '0') + '-' + day.toString().padStart(2, '0') +' 00:00:00';
        }

        populateDays(monthSelect.value);
        populateYears();

        // when the month or year <select> values are changed, rerun populateDays()
        // in case the change affected the number of available days
        yearSelect.onchange = function() {
            populateDays(monthSelect.value);
            updateInput();
        }

        monthSelect.onchange = function() {
            populateDays(monthSelect.value);
            updateInput();
        }

        // update what day has been set to previously
        // see end of populateDays() for usage
        daySelect.onchange = function() {
            activeDaySelection = daySelect.value;
            updateInput();
        }
    };



    var initDataSelect = function (field, options) {
        var settings = _.defaults(app.utils.getOptionsFromElement(field), options, defaults.dataSelect.options);
        new Choices(field, settings);

        field.addEventListener('showDropdown', function(event) {

        }, false);
    };


    // Matrix
    // =========================================================================

    var initMatrix = function (field, options) {
        var settings = _.defaults(app.utils.getOptionsFromElement(field), options, defaults.matrix.options);
        canAddBlocks(field);
    };

    var canAddBlocks = function (matrix) {

        if(_.isElement(matrix) && !matrix.hasAttribute('data-matrix-show-all-rows')) {

            var controls = matrix.querySelector('[data-matrix-controls]');
            if(controls) {

                if (matrix.hasAttribute('data-matrix-limit')) {

                    var allBlocks = matrix.querySelectorAll('[data-matrix-block]');
                    var allBlocksCount = allBlocks ? allBlocks.length : 0;
                    var limit = parseInt(matrix.getAttribute('data-matrix-limit'));

                    if(limit > allBlocksCount) {
                        controls.classList.remove('hidden');
                    } else {
                        controls.classList.add('hidden');
                    }

                } else {

                    controls.classList.remove('hidden');

                }
            }
        }
    }

    var showRowControls = function (block) {

        var row = block.closest('[data-matrix-row]');
        if(!row) return;

        var controls = row.querySelector('[data-matrix-controls]');
        if(!controls) return;

        controls.classList.remove('hidden');
    }

    var hideRowControls = function (block) {

        var row = block.closest('[data-matrix-row]');
        if(!row) return;

        var controls = row.querySelector('[data-matrix-controls]');
        if(!controls) return;

        controls.classList.add('hidden');
    }

    var matrixClickHandler = function(event) {

        var toggle = event.target;

        var matrix = toggle.closest(selectors.matrix);
        if (!matrix) return;

        if(toggle.classList.contains('is-submitting')) return;

        var showAllRows = matrix.hasAttribute('data-matrix-show-all-rows');

        var close = toggle.closest('[data-matrix-remove]');
        if(close) {
            event.preventDefault();
            var block = close.closest('[data-matrix-block]');
            if (showAllRows) {
                showRowControls(block);
            } else {
                canAddBlocks(matrix);
            }
            block.remove();
            return;
        }

        var add = toggle.closest('[data-matrix-new]');
        if(add) {
            event.preventDefault();
            toggle.classList.add('is-submitting');

            var allBlocks = matrix.querySelectorAll('[data-matrix-block]');

            var data = app.utils.prepAjaxRequestData({
                action: 'site/render/macro',
                name: 'matrixBlock',
                variables: {
                    name: matrix.getAttribute('data-matrix'),
                    type: add.getAttribute('data-matrix-new'),
                    new: true,
                    row: allBlocks ? parseInt(allBlocks.length) + 1 : 1
                }
            });

            atomic.ajax({
                type: 'POST',
                data: app.utils.serializeObject(data),
                url: '/',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                responseType: 'json',
            })
            .success(function (responseText, xhr) {

                var response = xhr.response;

                if(response.success && response.html) {

                    var block = app.utils.htmlToElement(response.html);

                    if (showAllRows) {
                        add.closest('[data-matrix-row]').appendChild(block);
                        hideRowControls(block);
                    } else {
                        matrix.querySelector('[data-matrix-blocks]').appendChild(block);
                        canAddBlocks(matrix);
                    }

                    _api.init(block);

                } else {

                    app.toasts.create({
                        type: 'error',
                        dismissable: true,
                        message: 'Row Data Unavailable',
                    });

                }
            })
            .error(function (responseText, xhr) {

                app.toasts.create({
                    type: 'error',
                    dismissable: true,
                    message: 'Row Data Unavailable',
                });

            })
            .always(function (responseText, xhr) {
                toggle.classList.remove('is-submitting');
            });

        }
    }


    // Public Api
    // =========================================================================

    _api.initDataSelects = function(options, context) {

        context = context || document;
        var settings = _.defaults(options, defaults.dataSelect);

        var fields = context.querySelectorAll(selectors.dataSelect);
        fields.forEach(function (field, index) {
            initDataSelect(field, settings);
        });
    }

    _api.initDatePickers = function(options, context) {

        context = context || document;
        var settings = _.defaults(options, defaults.datePicker);

        var inputs = context.querySelectorAll(selectors.datePicker);
        inputs.forEach(function (input, index) {
            initDatePicker(input, settings);
        });
    }

    _api.initDateSelects = function(options, context) {

        context = context || document;
        var settings = _.defaults(options, defaults.dateSelect);

        var fields = context.querySelectorAll(selectors.dateSelect);
        fields.forEach(function (field, index) {
            initDateSelect(field, settings);
        });
    }

    _api.initMatrix = function(options, context) {

        context = context || document;
        var settings = _.defaults(options, defaults.matrix);

        var fields = context.querySelectorAll(selectors.matrix);
        fields.forEach(function (field, index) {
            initMatrix(field, settings);
        });

        document.addEventListener('click', matrixClickHandler, false);
    }

    _api.init = function (context) {

        _api.initDataSelects({}, context);
        _api.initDatePickers({}, context);
        _api.initDateSelects({}, context);
        _api.initMatrix({}, context);

    };

    // Public Api
    // =========================================================================

    return _api;

})();
