REMOTE_USER="root"
REMOTE_HOST="164.90.211.116"
REMOTE_PROJECT_PATH="/root/auto-delovi-3sp-back"
REMOTE_PASSWORD="autO-delovi-3sp"

sshpass -p $REMOTE_PASSWORD ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST <<ENDSSH
    
    echo "Ulazak u folder uploads"
    cd "$REMOTE_PROJECT_PATH/uploads" || { echo "Folder 'uploads' ne postoji!"; exit 1; }

    # Brisanje svih .jpg fajlova u uploads folderu
    echo "Brisanje svih .jpg fajlova u uploads folderu"
    find . -type f -name "*.jpg" -exec rm -f {} \;
    echo "Svi .jpg fajlovi su obrisani."
    
ENDSSH

echo "Operacija brisanja završena!"
