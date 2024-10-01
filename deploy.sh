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

# Čuvanje json foldera
if [ -d "/root/auto-delovi-3sp-back/src/json" ]; then
    echo "Pronadjen je json folder, premeštanje..."
    mkdir /root/json_backup
    mv /root/auto-delovi-3sp-back/src/json/* /root/json_backup/
    echo "json folder je sačuvan"
else
    echo "json folder nije pronadjen"
fi

# Čuvanje upload foldera
if [ -d "/root/auto-delovi-3sp-back/uploads" ]; then
    echo "Pronadjen je json folder, premeštanje..."
    mkdir /root/uploads_backup
    mv /root/auto-delovi-3sp-back/uploads/* /root/uploads_backup/
    echo "uploads folder je sačuvan"
else
    echo "uploads folder nije pronadjen"
fi


# Brisanje postojećeg direktorijuma
if [ -d "auto-delovi-3sp-back" ]; then
    rm -rf auto-delovi-3sp-back
    echo "Obrisan je postojeći direktorijum auto-delovi-3sp-back"
fi

# Otpakivanje novog zip fajla
unzip -o auto-delovi-3sp-back.zip -d /root/
echo "Novi direktorijum auto-delovi-3sp-back je otpakovan"
cd auto-delovi-3sp-back
rm -rf node_modules
rm -rf package-lock.json
npm install
cd src
sed -i 's/PORT: 3001/PORT: 3000/' constants.ts
sed -i 's|URL: "http://localhost:3001"|URL: "https://api.auto-delovi-3sp.com"|' constants.ts


cd ..
pm2 restart all
npx tsc
pm2 start build/index.js --name "auto-delovi-3sp"
if [ -d "/root/json_backup" ]; then
    echo "Premeštanje json foldera nazad"
    mv /root/json_backup/* /root/auto-delovi-3sp-back/src/json/
    echo "json folder je vraćen"
else
    echo "json folder nije pronadjen u backup-u"
fi

if [ -d "/root/uploads_backup" ]; then
    echo "Premeštanje uploads_backup foldera nazad"
    rm -rf uploads
    mkdir uploads
    mv /root/uploads_backup/* /root/auto-delovi-3sp-back/uploads/
    echo "uploads folder je vraćen"
else
    echo "uploads folder nije pronadjen u backup-u"
fi

cd ..
rm -rf auto-delovi-3sp-back.zip
rm -rf json_backup
rm -rf uploads_backup
ENDSSH
echo "7: Deployment finished!"