LOCAL_PROJECT_PATH="/Users/milos/Documents/Workspace/srba-site/auto-delovi-3sp-back"
LOCAL_ZIP_FILE="auto-delovi-3sp-back.zip"
REMOTE_USER="root"
REMOTE_HOST="164.90.211.116"
REMOTE_PROJECT_PATH="/root/auto-delovi-3sp-back"
REMOTE_ZIP_PATH="/root/auto-delovi-3sp-back.zip"
REMOTE_PASSWORD="autO-delovi-3sp"

zip -r $LOCAL_ZIP_FILE $LOCAL_PROJECT_PATH

sshpass -p $REMOTE_PASSWORD scp $LOCAL_ZIP_FILE $REMOTE_USER@$REMOTE_HOST:$REMOTE_ZIP_PATH

sshpass -p $REMOTE_PASSWORD ssh $REMOTE_USER@$REMOTE_HOST << 'ENDSSH'

REMOTE_PROJECT_PATH="/root/auto-delovi-back-3sp"
REMOTE_ZIP_PATH="/root/auto-delovi-back-3sp.zip"

mkdir -p $REMOTE_PROJECT_PATH

unzip -o $REMOTE_ZIP_PATH -d $REMOTE_PROJECT_PATH

cd $REMOTE_PROJECT_PATH

npm install

pm2 restart all

rm $REMOTE_ZIP_PATH
ENDSSH
rm $LOCAL_ZIP_FILE

echo "Deployment finished!"
