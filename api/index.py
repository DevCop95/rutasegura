import sys
import os

# Asegurar que el directorio raíz está en el path para las importaciones
sys.path.append(os.path.join(os.getcwd(), 'apps', 'api'))

from app.main import app
