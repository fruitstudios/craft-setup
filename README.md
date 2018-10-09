## Craft Setup
Basic project structure for a Craft 3 set up. Includes some base macros, scss/js folder setup, and gulp workflow.

* Templates structure, includes directory structure for messages, notifications, layouts and macros.
* Essential Macros, fields, icons etc.
* Front-end gulp workflow for css/js & images.

## Setup Steps
* Install Craft
* Install Multi Environment Config and configure - [Github](https://github.com/nystudio107/craft3-multi-environment)

  * Copy config/db.php, config/general.php & config/volumes.php to your project's config/ folder
  * Copy web/index.php to your project's web/ folder
  * Copy the script craft to your project's root (this is the console bootstrap file for Craft)
  * Copy example.env.php to your project's root folder, then duplicate it, and rename the copy .env.php
  * Edit the .env.php file, replacing instances of REPLACE_ME with your appropriate settings

* Install Craft Scripts and configure - [Github](https://github.com/nystudio107/craft-scripts)

  * Copy the scripts directory into the root directory of your Craft CMS project
  * In the scripts directory, duplicate the craft3-example.env.sh file, and rename it to .env.sh. 
  * Then open up the .env.sh file in your editor, replace REPLACE_ME with the appropriate settings.
  
* Move the `src` folder from this repo to the project root
* Move `templates` to the project root 
* Add the `.htaccess` file from this repo to the `web` folder
* Copy `package.json gulpfile.js and .gitignore` to project root
* Run `$ npm install`
* Install [Field Manager Plugin](https://github.com/verbb/field-manager) `composer require verbb/field-manager`
* Import fields from `fields_to_import.json` file


### Acknowledgments

* [Craft CMS](https://craftcms.com)
* [NYStudios107](https://github.com/nystudio107)
