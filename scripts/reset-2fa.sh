#!/bin/bash
# Usage: ./scripts/reset-2fa.sh you@example.com
EMAIL="blxnktwxce@gmail.com"

if [ -z "$EMAIL" ]; then
  echo "Usage: ./scripts/reset-2fa.sh you@example.com"
  exit 1
fi

sqlite3 sqlite.db "
delete from twoFactor where userId = (select id from user where email = '$EMAIL');
update user set twoFactorEnabled = 0 where email = '$EMAIL';
"
echo "2FA reset for $EMAIL"