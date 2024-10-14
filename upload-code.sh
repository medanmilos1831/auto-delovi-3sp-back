# Definisanje varijabli
LOCAL_PROJECT_PATH="/Users/milos/Documents/Workspace/srba-site/auto-delovi-3sp-back"
LOCAL_ZIP_FILE="/Users/milos/Documents/Workspace/srba-site/auto-delovi-3sp-back.zip"
REMOTE_USER="root"
REMOTE_HOST="164.90.211.116"
REMOTE_PROJECT_PATH="/root/auto-delovi-3sp-back"
REMOTE_ZIP_PATH="/root/auto-delovi-3sp-back.zip"
REMOTE_PASSWORD="autO-delovi-3sp"

# Kompresovanje lokalnog projekta u ZIP fajl, isključujući json i uploads foldere
cd $LOCAL_PROJECT_PATH
zip -r $LOCAL_ZIP_FILE . -x "uploads/*" "json/*"

echo "1"
echo "2: Attempting to SCP file to remote server"

# Kopiranje ZIP fajla na udaljeni server
sshpass -p $REMOTE_PASSWORD scp -o StrictHostKeyChecking=no $LOCAL_ZIP_FILE $REMOTE_USER@$REMOTE_HOST:$REMOTE_ZIP_PATH

# Izvršavanje komandi na udaljenom serveru
sshpass -p $REMOTE_PASSWORD ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST << 'ENDSSH'
echo "Povezan sam na server"

# Ulazak u direktorijum auto-delovi-3sp-back
cd /root/auto-delovi-3sp-back

# Prebacivanje json i uploads foldera u root
if [ -d "json" ]; then
    mv json /root/
    echo "Json folder je prebačen u root"
else
    echo "Json folder ne postoji"
fi

if [ -d "uploads" ]; then
    mv uploads /root/
    echo "Uploads folder je prebačen u root"
else
    echo "Uploads folder ne postoji"
fi

if [ -f ".env.development" ]; then
    mv .env.development /root/
    echo ".env.development fajl je prebačen u root"
else
    echo ".env.development fajl ne postoji"
fi

if [ -f ".env.production" ]; then
    mv .env.production /root/
    echo ".env.production fajl je prebačen u root"
else
    echo ".env.production fajl ne postoji"
fi

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
# Vraćanje json i uploads foldera u novi direktorijum
if [ -d "/root/json" ]; then
    mv /root/json /root/auto-delovi-3sp-back/
    echo "Json folder je vraćen u novi direktorijum"
else
    echo "Json folder ne postoji u root"
fi

if [ -d "/root/uploads" ]; then
    mv /root/uploads /root/auto-delovi-3sp-back/
    echo "Uploads folder je vraćen u novi direktorijum"
else
    echo "Uploads folder ne postoji u root"
fi

if [ -f "/root/.env.development" ]; then
    mv /root/.env.development /root/auto-delovi-3sp-back/
    echo ".env.development fajl je vraćen u novi direktorijum"
else
    echo ".env.development fajl ne postoji u root"
fi

if [ -f "/root/.env.production" ]; then
    mv /root/.env.production /root/auto-delovi-3sp-back/
    echo ".env.production fajl je vraćen u novi direktorijum"
else
    echo ".env.production fajl ne postoji u root"
fi

# Čišćenje ZIP fajla
rm -rf /root/auto-delovi-3sp-back.zip
cd /root/auto-delovi-3sp-back/src
sed -i 's/PORT: 3001/PORT: 3000/' constants.js
sed -i 's|URL: "http://localhost:3001"|URL: "https://api.auto-delovi-3sp.com"|' constants.js
pm2 restart all
echo "Aplikacija je pokrenuta."
ENDSSH
rm -rf $LOCAL_ZIP_FILE
echo "Lokalni ZIP fajl je obrisan."
