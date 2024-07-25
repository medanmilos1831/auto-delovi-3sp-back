
LOCAL_PROJECT_PATH="/Users/milos/Documents/Workspace/srba-site/auto-delovi-3sp-back"
LOCAL_ZIP_FILE="/Users/milos/Documents/Workspace/srba-site/auto-delovi-3sp-back.zip"
REMOTE_USER="root"
REMOTE_HOST="164.90.211.116"
REMOTE_PROJECT_PATH="/root/auto-delovi-3sp-back"
REMOTE_ZIP_PATH="/root/auto-delovi-3sp-back.zip"
REMOTE_PASSWORD="autO-delovi-3sp"

cd /Users/milos/Documents/Workspace/srba-site/
zip -r auto-delovi-3sp-back.zip auto-delovi-3sp-back
echo "1"
echo "2: Attempting to SCP file to remote server"
# Kopiranje zip fajla na udaljeni server
sshpass -p $REMOTE_PASSWORD scp -o StrictHostKeyChecking=no $LOCAL_ZIP_FILE $REMOTE_USER@$REMOTE_HOST:$REMOTE_ZIP_PATH

# Izvršavanje komandi na udaljenom serveru
sshpass -p $REMOTE_PASSWORD ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST <<'ENDSSH'
echo "Povezan sam na server"
hostname

# Brisanje postojećeg direktorijuma
if [ -d "auto-delovi-3sp-back" ]; then
    rm -rf auto-delovi-3sp-back
    echo "Obrisan je postojeći direktorijum auto-delovi-3sp-back"
fi

# Otpakivanje novog zip fajla
unzip -o auto-delovi-3sp-back.zip -d /root/
echo "Novi direktorijum auto-delovi-3sp-back je otpakovan"
cd auto-delovi-3sp-back
npm install
pm2 restart all
cd ..
rm -rf auto-delovi-3sp-back.zip
ENDSSH

# mkdir -p $REMOTE_PROJECT_PATH
# unzip -o $REMOTE_ZIP_PATH -d $REMOTE_PROJECT_PATH
# echo "5: after Unzip"
# cd $REMOTE_PROJECT_PATH
# npm install
# pm2 restart all
# rm $REMOTE_ZIP_PATH
# rm $LOCAL_ZIP_FILE
echo "7: Deployment finished!"

# sshpass -p $REMOTE_PASSWORD scp $LOCAL_ZIP_FILE $REMOTE_USER@$REMOTE_HOST:$REMOTE_ZIP_PATH
# echo "2"


# # sshpass -p $REMOTE_PASSWORD
# echo "2"

# sshpass -p $REMOTE_PASSWORD ssh $REMOTE_USER@$REMOTE_HOST
# # ssh $REMOTE_USER@$REMOTE_HOST
# scp $LOCAL_ZIP_FILE $REMOTE_USER@$REMOTE_HOST:$REMOTE_ZIP_PATH
# # echo "3"

# # REMOTE_PROJECT_PATH="/root/auto-delovi-back-3sp"
# # REMOTE_ZIP_PATH="/root/auto-delovi-back-3sp.zip"

# echo "BEFORE Unzip"


# unzip -o $REMOTE_ZIP_PATH -d $REMOTE_PROJECT_PATH
# echo "after Unzip"
# # cd $REMOTE_PROJECT_PATH
# echo "before install"
# npm install

# pm2 restart all

# rm $REMOTE_ZIP_PATH
# # ENDSSH
# rm $LOCAL_ZIP_FILE

echo "Deployment finished!"
