#!/bin/bash

set -e

node /var/node_app/rosatom_guide_server/cron_tasks.js
pm2 flush
