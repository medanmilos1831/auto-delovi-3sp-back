#!/bin/bash

# Definisanje varijabli (ne diram tvoje)
LOCAL_PROJECT_PATH="/Users/milos/Documents/Workspace/srba-site/auto-delovi-3sp-back"
LOCAL_ZIP_FILE="/Users/milos/Documents/Workspace/srba-site/auto-delovi-3sp-back.zip"
REMOTE_USER="root"
REMOTE_HOST="164.90.211.116"
REMOTE_PROJECT_PATH="/root/auto-delovi-3sp-back"
REMOTE_ZIP_PATH="/root/auto-delovi-3sp-back.zip"
REMOTE_PASSWORD="autO-delovi-3sp"

# Kompresovanje lokalnog projekta u ZIP fajl
cd $LOCAL_PROJECT_PATH
zip -r $LOCAL_ZIP_FILE .

echo "1"
echo "2: Attempting to SCP file to remote server"

# Kopiranje ZIP fajla na udaljeni server
sshpass -p $REMOTE_PASSWORD scp -o StrictHostKeyChecking=no $LOCAL_ZIP_FILE $REMOTE_USER@$REMOTE_HOST:$REMOTE_ZIP_PATH

# Izvršavanje komandi na udaljenom serveru
sshpass -p $REMOTE_PASSWORD ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST << 'ENDSSH'
echo "Povezan sam na server"

# Brisanje postojećeg direktorijuma (ako postoji)
if [ -d "/root/auto-delovi-3sp-back" ]; then
    rm -rf /root/auto-delovi-3sp-back
    echo "Obrisan je postojeći direktorijum auto-delovi-3sp-back"
fi

# Kreiranje novog direktorijuma za raspakivanje
mkdir /root/auto-delovi-3sp-back

# Otpakivanje ZIP fajla u novi direktorijum
unzip -o /root/auto-delovi-3sp-back.zip -d /root/auto-delovi-3sp-back
echo "Novi direktorijum auto-delovi-3sp-back je otpakovan"

# Čišćenje ZIP fajla
rm -rf /root/auto-delovi-3sp-back.zip

# Instalacija zavisnosti
cd /root/auto-delovi-3sp-back
npm install

# Pokretanje aplikacije koristeći PM2 sa ecosystem.config.js fajlom
pm2 restart ecosystem.config.js --env production
echo "Aplikacija je pokrenuta."

ENDSSH

# Brisanje lokalnog ZIP fajla
rm -rf $LOCAL_ZIP_FILE
echo "Lokalni ZIP fajl je obrisan."

echo "7: Deployment finished!"
