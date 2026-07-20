# 🌳 Guía de Configuración: Backend de Solicitud de Poda Pública

## PORTOPARQUES EP — Sistema Web de Solicitudes

---

> **📌 Propósito de esta guía:**
> Esta guía le ayudará paso a paso a configurar el sistema backend (servidor) que procesa las solicitudes de poda pública enviadas desde el sitio web de Portoparques EP. Al finalizar, el formulario web podrá guardar automáticamente las solicitudes en una hoja de cálculo de Google y enviar correos de confirmación.

---

## 📋 Índice

1. [Acceder a la cuenta de Google](#paso-1-acceder-a-la-cuenta-de-google)
2. [Crear la Hoja de Cálculo (Google Sheets)](#paso-2-crear-la-hoja-de-cálculo-google-sheets)
3. [Configurar los encabezados de la hoja](#paso-3-configurar-los-encabezados-de-la-hoja)
4. [Crear la carpeta de fotos en Google Drive](#paso-4-crear-la-carpeta-de-fotos-en-google-drive)
5. [Abrir Google Apps Script](#paso-5-abrir-google-apps-script)
6. [Copiar el código del script](#paso-6-copiar-el-código-del-script)
7. [Configurar los IDs en el script](#paso-7-configurar-los-ids-en-el-script)
8. [Configurar la zona horaria](#paso-8-configurar-la-zona-horaria)
9. [Desplegar como Aplicación Web](#paso-9-desplegar-como-aplicación-web)
10. [Copiar la URL en el código React](#paso-10-copiar-la-url-en-el-código-react)
11. [Probar el sistema](#paso-11-probar-el-sistema)
12. [Solución de problemas comunes](#solución-de-problemas-comunes)

---

## Paso 1: Acceder a la cuenta de Google

1. Abra su navegador web (Chrome, Firefox, Edge, etc.).
2. Vaya a [https://accounts.google.com](https://accounts.google.com).
3. Inicie sesión con la cuenta institucional:
   - **Correo:** `portoparquesepoficial@gmail.com`
   - **Contraseña:** (use la contraseña institucional asignada)
4. Si ya tiene una sesión abierta con otra cuenta, haga clic en su foto de perfil (esquina superior derecha) y seleccione **"Agregar otra cuenta"** o **"Cambiar de cuenta"**.

> ⚠️ **Importante:** Todos los pasos siguientes deben realizarse con esta cuenta. Verifique que aparezca `portoparquesepoficial@gmail.com` en la esquina superior derecha de la pantalla.

---

## Paso 2: Crear la Hoja de Cálculo (Google Sheets)

1. Vaya a [Google Sheets](https://sheets.google.com) o escriba `sheets.google.com` en su navegador.
2. Haga clic en el botón **"+ En blanco"** (o el ícono con el signo **+** de colores) para crear una nueva hoja de cálculo.
3. En la esquina superior izquierda, donde dice "Hoja de cálculo sin título", haga clic y escriba:

   ```
   Portoparques - Solicitudes Poda Pública
   ```

4. Presione **Enter** para guardar el nombre.
5. La pestaña de la hoja (en la parte inferior) se llama "Hoja 1" por defecto. Haga **doble clic** en esa pestaña y renómbrela a:

   ```
   Solicitudes
   ```

6. **Obtenga el ID de la hoja:** Mire la barra de direcciones de su navegador. La URL se verá así:

   ```
   https://docs.google.com/spreadsheets/d/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/edit
   ```

   El texto largo entre `/d/` y `/edit` es el **ID de la hoja**. Cópielo y guárdelo en un lugar seguro (bloc de notas, por ejemplo). Lo necesitará más adelante.

   > **Ejemplo de ID:** `1A2B3C4D5E6F7G8H9I0J_abcdefghijklmnop`

---

## Paso 3: Configurar los encabezados de la hoja

> **Nota:** El script creará automáticamente los encabezados si la hoja está vacía. Sin embargo, puede configurarlos manualmente si lo prefiere.

En la primera fila de la hoja, escriba los siguientes encabezados (uno en cada celda, de la A a la N):

| Celda | Encabezado |
|-------|-----------|
| A1 | ID Trámite |
| B1 | Fecha y Hora |
| C1 | Nombre y Apellidos |
| D1 | Dirección |
| E1 | Ubicación Google Maps |
| F1 | Parroquia |
| G1 | Cédula |
| H1 | Teléfono |
| I1 | Correo Electrónico |
| J1 | Comentario |
| K1 | Foto (enlace Drive) |
| L1 | Estado |
| M1 | Fecha Atención |
| N1 | Observaciones |

**Para dar formato a los encabezados (opcional pero recomendado):**

1. Seleccione toda la fila 1 (haga clic en el número "1" en el lado izquierdo).
2. Ponga el texto en **negrita** (Ctrl + B).
3. Cambie el color de fondo a verde oscuro y el texto a blanco.
4. Vaya al menú **Ver → Inmovilizar → 1 fila** para que los encabezados siempre sean visibles.

---

## Paso 4: Crear la carpeta de fotos en Google Drive

1. Vaya a [Google Drive](https://drive.google.com) o escriba `drive.google.com` en su navegador.
2. En el panel izquierdo, haga clic en **"+ Nuevo"** (botón con un signo +).
3. Seleccione **"Carpeta"**.
4. Escriba el nombre de la carpeta:

   ```
   Fotos - Solicitudes Poda Pública
   ```

5. Haga clic en **"Crear"**.
6. Abra la carpeta que acaba de crear (haga doble clic en ella).
7. **Obtenga el ID de la carpeta:** Mire la barra de direcciones. La URL se verá así:

   ```
   https://drive.google.com/drive/folders/YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
   ```

   El texto después de `/folders/` es el **ID de la carpeta**. Cópielo y guárdelo junto con el ID de la hoja.

   > **Ejemplo de ID:** `1XyZ_AbCdEfGhIjKlMnOpQrStUvWx`

---

## Paso 5: Abrir Google Apps Script

1. Regrese a la hoja de cálculo "Portoparques - Solicitudes Poda Pública" (puede buscarla en [sheets.google.com](https://sheets.google.com)).
2. En el menú superior, haga clic en **Extensiones → Apps Script**.

   > Si no ve la opción "Apps Script", busque en el menú "Herramientas" → "Editor de secuencias de comandos" (puede variar según el idioma).

3. Se abrirá una nueva pestaña con el editor de código de Apps Script. Verá un archivo llamado `Código.gs` con una función vacía.
4. **Seleccione TODO** el contenido existente (Ctrl + A) y **elimínelo** (presione Delete o Suprimir).

---

## Paso 6: Copiar el código del script

1. Abra el archivo `google-apps-script-code.js` que se encuentra en la carpeta `docs` del proyecto web:

   ```
   Portoparquesweb/docs/google-apps-script-code.js
   ```

2. Seleccione **TODO** el contenido del archivo (Ctrl + A).
3. Cópielo (Ctrl + C).
4. Regrese a la pestaña de Apps Script en su navegador.
5. Pegue el código (Ctrl + V) en el editor.
6. Guarde el proyecto con **Ctrl + S** o haga clic en el ícono del disquete 💾.
7. Si le pide un nombre para el proyecto, escríbalo como:

   ```
   Portoparques - Backend Poda Pública
   ```

---

## Paso 7: Configurar los IDs en el script

En las primeras líneas del código que acaba de pegar, encontrará la sección de **CONFIGURACIÓN**. Debe reemplazar dos valores:

### 7.1 Configurar el ID de la Hoja de Cálculo

Busque esta línea (aproximadamente en la línea 15):

```javascript
var SHEET_ID = 'PEGAR_AQUI_EL_ID_DE_LA_HOJA';
```

Reemplace `PEGAR_AQUI_EL_ID_DE_LA_HOJA` con el ID que copió en el **Paso 2**, punto 6. Asegúrese de mantener las comillas simples. El resultado debería verse así:

```javascript
var SHEET_ID = '1A2B3C4D5E6F7G8H9I0J_abcdefghijklmnop';
```

### 7.2 Configurar el ID de la Carpeta de Drive

Busque esta línea (aproximadamente en la línea 18):

```javascript
var FOLDER_ID = 'PEGAR_AQUI_EL_ID_DE_LA_CARPETA';
```

Reemplace `PEGAR_AQUI_EL_ID_DE_LA_CARPETA` con el ID que copió en el **Paso 4**, punto 7:

```javascript
var FOLDER_ID = '1XyZ_AbCdEfGhIjKlMnOpQrStUvWx';
```

### 7.3 Configurar el correo del encargado (opcional)

Si desea que un encargado específico también reciba las notificaciones, busque la línea:

```javascript
var CORREO_ENCARGADO = '';
```

Y coloque el correo del encargado entre las comillas:

```javascript
var CORREO_ENCARGADO = 'encargado@portoparques.gob.ec';
```

> Si no desea enviar a un encargado adicional, déjelo vacío como está (`''`).

### 7.4 Guardar los cambios

Después de configurar los IDs, presione **Ctrl + S** para guardar.

---

## Paso 8: Configurar la zona horaria

Para que las fechas y horas se registren correctamente en hora de Ecuador:

1. En el editor de Apps Script, haga clic en el ícono de **⚙️ Configuración del proyecto** (engranaje) en el panel lateral izquierdo.
2. En la sección **"Zona horaria"**, seleccione:

   ```
   (GMT-05:00) Ecuador Time - America/Guayaquil
   ```

3. Haga clic en **"Guardar configuración"** si aparece el botón.

---

## Paso 9: Desplegar como Aplicación Web

Este es el paso más importante. Aquí haremos que el script esté disponible en internet para que el sitio web pueda comunicarse con él.

1. En el editor de Apps Script, haga clic en el botón **"Implementar"** (o **"Deploy"**) en la esquina superior derecha.
2. Seleccione **"Nueva implementación"** (o **"New deployment"**).
3. En la ventana que aparece, haga clic en el ícono de engranaje ⚙️ junto a "Seleccionar tipo" y seleccione **"Aplicación web"** (o **"Web app"**).
4. Configure los siguientes campos:

   | Campo | Valor |
   |-------|-------|
   | **Descripción** | `Formulario Poda Pública v1.0` |
   | **Ejecutar como** | `Yo (portoparquesepoficial@gmail.com)` |
   | **Quién tiene acceso** | `Cualquier persona` |

   > ⚠️ **MUY IMPORTANTE:** En "Quién tiene acceso" DEBE seleccionar **"Cualquier persona"** (o "Anyone"), de lo contrario el formulario web no podrá enviar datos.

5. Haga clic en **"Implementar"** (o **"Deploy"**).
6. La primera vez, Google le pedirá que **autorice** los permisos del script:
   - Haga clic en **"Autorizar acceso"**.
   - Seleccione la cuenta `portoparquesepoficial@gmail.com`.
   - Si aparece una advertencia que dice "Google no ha verificado esta aplicación":
     - Haga clic en **"Avanzado"** (o **"Advanced"**).
     - Luego haga clic en **"Ir a Portoparques - Backend Poda Pública (no seguro)"** (o "Go to...").
   - Haga clic en **"Permitir"** (o **"Allow"**).
7. Después de autorizar, aparecerá la **URL de la aplicación web**. Se verá algo así:

   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```

8. **Copie esta URL completa.** La necesitará en el siguiente paso.

> **💡 Consejo:** Guarde esta URL en un documento seguro. Si la pierde, puede encontrarla de nuevo yendo a **Implementar → Administrar implementaciones**.

---

## Paso 10: Copiar la URL en el código React

Ahora debe indicarle al sitio web de Portoparques dónde enviar los formularios.

1. Abra el archivo del formulario de poda pública en el proyecto web. El archivo se encuentra en:

   ```
   src/pages/PodaPublica.jsx
   ```

   > Si el archivo aún no existe, se creará más adelante como parte del desarrollo del frontend.

2. Busque la línea que contiene `APPS_SCRIPT_URL` (o la variable donde se define la URL del backend). Se verá algo así:

   ```javascript
   const APPS_SCRIPT_URL = 'PEGAR_URL_AQUI';
   ```

3. Reemplace `'PEGAR_URL_AQUI'` con la URL que copió en el paso anterior:

   ```javascript
   const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx.../exec';
   ```

4. Guarde el archivo.

---

## Paso 11: Probar el sistema

### 11.1 Prueba desde el editor de Apps Script

Antes de probar desde el sitio web, verifique que el script funciona correctamente:

1. En el editor de Apps Script, busque la función `pruebaEnvioFormulario` al final del código.
2. **Antes de ejecutar**, cambie el correo de prueba en la línea que dice:

   ```javascript
   correo: 'prueba@ejemplo.com', // ⚠️ Cambie esto por un correo real de prueba
   ```

   Cámbielo por un correo real al que tenga acceso para verificar que llega el correo.

3. Seleccione la función `pruebaEnvioFormulario` en el menú desplegable de funciones (arriba del editor).
4. Haga clic en el botón **▶ Ejecutar**.
5. Espere unos segundos. Si todo está correcto:
   - Verá un registro en la consola sin errores (abajo en el editor o en **Ver → Registros**).
   - Se creará una nueva fila en la hoja de cálculo con los datos de prueba.
   - Recibirá un correo de confirmación en el correo que configuró.
   - El correo institucional (`info@portoparques.gob.ec`) recibirá la notificación.

### 11.2 Prueba desde la línea de comandos (para desarrolladores)

Si tiene acceso a una terminal, puede probar el endpoint con `curl`:

```bash
curl -L -X POST \
  "https://script.google.com/macros/s/AKfycbx.../exec" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María López",
    "direccion": "Av. Manabí y Calle Sucre",
    "ubicacion": "https://www.google.com/maps?q=-1.0547,-80.4545",
    "parroquia": "Portoviejo",
    "cedula": "1398765432",
    "telefono": "0987654321",
    "correo": "su-correo-real@gmail.com",
    "comentario": "Árbol con ramas peligrosas cerca de la acera",
    "foto": "",
    "fotoNombre": ""
  }'
```

> **Nota:** Reemplace la URL con su URL real de implementación y el correo con uno real.

La respuesta esperada es:

```json
{
  "success": true,
  "id": "PP-PODA-2026-000001",
  "mensaje": "Su solicitud ha sido registrada exitosamente."
}
```

### 11.3 Prueba desde el sitio web

1. Abra el sitio web de Portoparques en su navegador.
2. Navegue al formulario de Poda Pública.
3. Complete todos los campos con datos de prueba.
4. Envíe el formulario.
5. Debe aparecer un mensaje de confirmación con el código de trámite.
6. Verifique que los datos aparezcan en la hoja de cálculo.
7. Verifique que se recibieron los correos de confirmación.

---

## Solución de problemas comunes

### ❌ "No se puede acceder al servicio" o "Error 403"

- **Causa:** El script no está desplegado como "Cualquier persona".
- **Solución:** Vaya a **Implementar → Administrar implementaciones**, edite la implementación activa y asegúrese de que "Quién tiene acceso" sea **"Cualquier persona"**.

### ❌ "Error al ejecutar: No tienes permiso"

- **Causa:** No se autorizaron los permisos del script.
- **Solución:** Ejecute cualquier función desde el editor (por ejemplo, `pruebaEnvioFormulario`) y complete el proceso de autorización que aparece.

### ❌ Los datos no aparecen en la hoja de cálculo

- **Causa posible 1:** El `SHEET_ID` es incorrecto.
  - **Solución:** Verifique que el ID coincide con el de la URL de la hoja.
- **Causa posible 2:** El nombre de la pestaña no es "Solicitudes".
  - **Solución:** Verifique que el nombre de la pestaña sea exactamente `Solicitudes` (sin espacios extra, respetando mayúsculas/minúsculas).

### ❌ Las fotos no se guardan en Drive

- **Causa:** El `FOLDER_ID` es incorrecto o la cuenta no tiene permisos.
- **Solución:** Verifique que el ID de la carpeta sea correcto y que la carpeta pertenezca a la cuenta `portoparquesepoficial@gmail.com`.

### ❌ No llegan los correos de confirmación

- **Causa posible 1:** Los correos pueden estar en la carpeta de **Spam**.
  - **Solución:** Revise la carpeta de spam del destinatario.
- **Causa posible 2:** Se superó el límite diario de correos de Gmail (500 correos/día para cuentas gratuitas).
  - **Solución:** Espere al día siguiente o use una cuenta de Google Workspace.
- **Causa posible 3:** El correo del ciudadano tiene un formato incorrecto.
  - **Solución:** Verifique que el correo ingresado en el formulario sea válido.

### ❌ El ID de trámite no se incrementa correctamente

- **Causa:** Podría haber filas eliminadas o datos irregulares en la columna A.
- **Solución:** Asegúrese de no eliminar filas de la hoja. Si necesita anular una solicitud, cambie su estado en la columna "Estado" en lugar de eliminar la fila.

### ❌ "TypeError: Cannot read property..." o errores de JavaScript

- **Causa:** Algún campo del formulario no se está enviando correctamente.
- **Solución:** Verifique que el frontend envíe TODOS los campos requeridos, incluso si están vacíos (enviar `""` en lugar de `null` o `undefined`).

### ❌ Error de CORS al enviar desde el sitio web

- **Causa:** El navegador bloquea la solicitud por política de seguridad.
- **Solución:** Asegúrese de que el frontend use `mode: 'no-cors'` en el `fetch`, o envíe los datos como formulario. Ejemplo:

  ```javascript
  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify(datos)
    // No incluir mode: 'no-cors' si desea leer la respuesta
    // Google Apps Script maneja CORS automáticamente cuando se despliega como "Cualquier persona"
  });
  ```

  > **Nota importante:** Si usa `mode: 'no-cors'`, no podrá leer la respuesta JSON. Para leer la respuesta, **no** incluya esa opción y asegúrese de que el script esté desplegado como "Cualquier persona".

### ❌ Los cambios al código no se reflejan

- **Causa:** Después de modificar el código, debe crear una **nueva implementación**.
- **Solución:**
  1. Vaya a **Implementar → Administrar implementaciones**.
  2. Haga clic en el ícono del ✏️ lápiz para editar.
  3. En "Versión", seleccione **"Nueva versión"**.
  4. Haga clic en **"Implementar"**.
  5. **Use la misma URL** que ya tenía configurada (no cambia).

---

## 📞 Soporte

Si tiene problemas adicionales con la configuración:

- Revise los registros del script: en el editor de Apps Script, vaya a **Ver → Ejecuciones** para ver un historial de las solicitudes procesadas y posibles errores.
- Contacte al equipo de desarrollo web para asistencia técnica.

---

> **Última actualización:** Mayo 2026
> **Versión del script:** 1.0.0
