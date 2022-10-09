#!/bin/bash
#
# packager.io postinstall script
#
PATH=${APP_HOME}/env/bin:${APP_HOME}/:/sbin:/bin:/usr/sbin:/usr/bin:

# default config
export CONF_DIR=/etc/inventree
export DATA_DIR=${APP_HOME}/data
export INVENTREE_MEDIA_ROOT=${DATA_DIR}/media
export INVENTREE_STATIC_ROOT=${DATA_DIR}/static
export INVENTREE_PLUGINS_ENABLED=true
export INVENTREE_PLUGIN_FILE=${CONF_DIR}/plugins.txt
export INVENTREE_CONFIG_FILE=${CONF_DIR}/config.yaml
export INVENTREE_SECRET_KEY_FILE=${CONF_DIR}/secret_key.txt
export INVENTREE_DB_NAME=${DATA_DIR}/database.sqlite3
export INVENTREE_DB_ENGINE=sqlite3
# get setup log path
export SETUP_LOG=${CONF_DIR}/setup_$(date +"%F_%H_%M_%S").log

# import functions
. ${APP_HOME}/contrib/packager.io/functions

# start log
# script $SETUP_LOG -q
# echo "# Starting log"

# get base info
detect_docker
detect_initcmd
detect_ip

# create processes
create_initscripts
create_admin

# run updates
stop_inventree
update_or_install
set_env
start_inventree

# end log
# echo "# Ending log"
# exit 0

# show info
final_message
