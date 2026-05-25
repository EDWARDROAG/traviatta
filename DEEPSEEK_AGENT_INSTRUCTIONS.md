# Instrucciones para el agente Deepseek

## Contexto
Este proyecto es un sistema `menu-qr-system` con frontend React/Vite y backend Node/Express. El problema actual está en el flujo de checkout / pedido:
- El backend espera un payload de `POST /api/order` con `branch_id`, `items[].product_id`, `order_type`, `payment_method`, etc.
- El payload actual que se está probando usa campos incorrectos como `branch_name`, `items[].name` y no cumple la validación.
- También hay un fallback de WhatsApp/telefono que debe funcionar si falta `branch_whatsapp`.

## Objetivo
Arreglar la integración de checkout para que:
1. El frontend envíe el pedido con el esquema correcto.
2. El backend acepte el pedido y responda exitosamente.
3. El flujo final permita abrir WhatsApp o confirmar pedido sin errores.

## Pasos principales
1. Revisar y corregir el frontend:
   - `frontend/src/pages/MenuPage.jsx`
   - `frontend/src/pages/CheckoutPage.jsx`
   - `frontend/src/services/api.js`
   - `frontend/src/services/whatsapp.js`
2. Revisar la validación del backend del endpoint `POST /api/order`:
   - `backend/src/middleware/validation.js`
   - cualquier controlador de `order` relevante en `backend/src/controllers` o `backend/src/routes`
3. Ajustar el payload de checkout para incluir:
   - `branch_id`
   - `customer_name`
   - `customer_phone`
   - `order_type`
   - `delivery_address`
   - `items`: cada item debe tener `product_id`, `quantity`, `modifiers`
   - `payment_method`
   - `notes`
4. Verificar que la información de la sucursal venga correctamente desde el menú a la página de checkout.
5. Añadir fallback en WhatsApp:
   - usar `branch_whatsapp` si existe
   - si no, usar `branch_phone` o teléfono alternativo de la sucursal
6. Probar en local:
   - `GET /api/el-sabor-costeno/menu`
   - `POST /api/order` con payload validado
   - checkout desde el navegador y confirmar la respuesta.

## Qué debe hacer Deepseek
- Identificar dónde se genera el body de pedido en el frontend.
- Corregirlo para que coincida con la documentación del backend.
- Revisar y ajustar la validación de backend si es necesario, pero solo si el frontend ya está enviando lo correcto.
- Confirmar que el flujo completo está OK con pruebas locales.

## Resultado esperado
- Checkout funcional desde la UI.
- `POST /api/order` retorna `200` o `201` con datos de orden.
- No hay errores de validación por campos faltantes.
- WhatsApp apertura correcta con número de sucursal válido.
