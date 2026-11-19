#!/bin/bash
# Usage: ./scripts/delete-user.sh you@example.com
EMAIL="test@gmail.com"

if [ -z "$EMAIL" ]; then
  echo "Usage: ./scripts/delete-user.sh you@example.com"
  exit 1
fi

sqlite3 sqlite.db "
delete from twoFactor where userId = (select id from user where email = '$EMAIL');
delete from session where userId = (select id from user where email = '$EMAIL');
delete from account where userId = (select id from user where email = '$EMAIL');
delete from user where email = '$EMAIL';
"
echo "Deleted $EMAIL"