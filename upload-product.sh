#!/bin/bash

# Putanja do lokalnog projekta
LOCAL_PROJECT_PATH="/Users/milos/Documents/Workspace/srba-site/auto-delovi-3sp-back"

# Putanja do foldera sa proizvodima
LOCAL_PRODUCTS_FOLDER="$LOCAL_PROJECT_PATH/uploads/product"

# Putanja do ZIP fajla koji će se kreirati
LOCAL_ZIP_FILE="/Users/milos/Documents/Workspace/srba-site/product.zip"
REMOTE_USER="root"
REMOTE_HOST="164.90.211.116"
REMOTE_PROJECT_PATH="/root/auto-delovi-3sp-back"
REMOTE_ZIP_PATH="/root/product.zip"
REMOTE_PASSWORD="autO-delovi-3sp"

# Ulazimo u folder 'product' i pravimo ZIP fajl
echo "Ulazak u folder $LOCAL_PRODUCTS_FOLDER i pravljenje ZIP arhive"
cd "$LOCAL_PRODUCTS_FOLDER" || { echo "Folder ne postoji!"; exit 1; }

# Kreiranje ZIP fajla sa svim fajlovima iz 'product' foldera
zip -r "$LOCAL_ZIP_FILE" .  # '.' označava sve fajlove u trenutnom folderu
echo "ZIP fajl je kreiran: $LOCAL_ZIP_FILE"

# Prebacivanje ZIP fajla na server
echo "Prebacivanje $LOCAL_ZIP_FILE na server $REMOTE_HOST u $REMOTE_ZIP_PATH"
sshpass -p $REMOTE_PASSWORD scp -o StrictHostKeyChecking=no $LOCAL_ZIP_FILE $REMOTE_USER@$REMOTE_HOST:$REMOTE_ZIP_PATH

# Ulazak na server i izvršavanje komandi
# echo "Povezivanje na server $REMOTE_HOST"
# sshpass -p $REMOTE_PASSWORD ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST <<ENDSSH
#     echo "Povezan sam na server"
    
#     # Brisanje postojećeg 'product' foldera
#     if [ -d "$REMOTE_PROJECT_PATH/uploads/product" ]; then
#         rm -rf "$REMOTE_PROJECT_PATH/uploads/product"
#         echo "Postojeći folder 'product' je obrisan."
#     else
#         echo "Folder 'product' ne postoji."
#     fi

#     # Raspakivanje ZIP fajla unutar 'uploads/product'
#     mkdir -p "$REMOTE_PROJECT_PATH/uploads/product"
#     unzip -o "$REMOTE_ZIP_PATH" -d "$REMOTE_PROJECT_PATH/uploads/product/"
#     echo "ZIP fajl je raspakovan u '$REMOTE_PROJECT_PATH/uploads/product/'."
# ENDSSH

echo "Prebacivanje i raspakivanje završeno!"
