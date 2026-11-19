# 🔐 Guía de Refactorización de Autenticación y Persistencia de Sesión

## 📋 Resumen General

Se ha refactorizado completamente el sistema de autenticación y persistencia de sesión de la aplicación móvil Angular/Ionic/Capacitor para:

- ✅ **Persistir la sesión** entre reinicios de la app
- ✅ **Almacenar el token de forma segura** en el almacenamiento nativo (no en cookies)
- ✅ **Inicializar automáticamente** el usuario si hay sesión válida
- ✅ **Inyectar automáticamente** el Bearer Token en peticiones HTTP
- ✅ **Eliminar rastros** de almacenamiento en texto plano

---

## 🔧 Dependencias Instaladas

```json
"capacitor-secure-storage-plugin": "^0.13.0"
```

**Nota:** `@capacitor/preferences` ya estaba instalado.

---

## 📁 Archivos Modificados

### 1. **StorageService** (`src/app/core/services/storage.service.ts`)

**Cambios clave:**
- Tokens guardados en **Secure Storage nativo** (encriptado a nivel de SO)
- Datos de usuario guardados en **Preferences** (localStorage persistente)
- Todos los métodos ahora son **async**
- Manejo robusto de errores

| Método | Almacenamiento | Tipo |
|--------|-----------------|------|
| `setToken(key, value)` | Secure Storage | `Promise<void>` |
| `getToken(key)` | Secure Storage | `Promise<string\|null>` |
| `removeToken(key)` | Secure Storage | `Promise<void>` |
| `setSecureData(key, value)` | Preferences | `Promise<void>` |
| `getSecureData(key)` | Preferences | `Promise<any>` |
| `removeSecureData(key)` | Preferences | `Promise<void>` |

### 2. **AuthService** (`src/app/core/services/auth.service.ts`)

**Cambios clave:**
- `initializeAuthState()` ahora es **público** y retorna `Promise<boolean>`
- `getToken()` es ahora **async** y retorna `Promise<string | null>`
- `logout()` limpia completamente ambos almacenamientos
- Control de inicialización única con flag `isInitialized`

**Métodos principales:**
```typescript
// Inicializa el estado de autenticación (llamado en app.component)
async initializeAuthState(): Promise<boolean>

// Login/SignUp guardan token y datos automáticamente
async login(email: string, password: string): Promise<UserCredential>
async signUp(email: string, password: string): Promise<UserCredential>

// Logout limpia todo
async logout(): Promise<void>

// Obtener token de forma segura
async getToken(): Promise<string | null>
```

### 3. **AuthGuard** (`src/app/core/guards/auth.guard.ts`)

**Cambios clave:**
- Verificación **async** del token y datos de usuario
- Redirige a `/login` si no hay sesión válida
- Manejo robusto de errores

### 4. **NoAuthGuard** (`src/app/core/guards/no-auth.guard.ts`)

**Cambios clave:**
- Previene que usuarios autenticados accedan a `/login` o `/register`
- Redirige a `/tabs/home` si ya está autenticado

### 5. **AppComponent** (`src/app/app.component.ts`)

**Cambios clave:**
- Implementa `OnInit` para ejecutar `initializeApp()`
- Verifica sesión persistente al arrancar la app
- Navega automáticamente a Home si hay token válido
- Navega a Login si no hay sesión

**Flujo:**
```
App Launch
    ↓
app.component.ts (OnInit)
    ↓
initializeApp()
    ↓
AuthService.initializeAuthState()
    ↓
¿Token + UserData existen?
    ├─ SÍ  → Navegar a /tabs/home
    └─ NO  → Navegar a /login
```

### 6. **AppModule** (`src/app/app.module.ts`)

**Cambios clave:**
- Registrado `HTTP_INTERCEPTORS` con `AuthInterceptor`
- Removido `CookieService` del providers (ya no se necesita)
- Imports reorganizados y limpiados

---

## ✨ Archivos Creados

### **AuthInterceptor** (`src/app/core/interceptors/auth.interceptor.ts`) - NUEVO

**Funcionalidad:**
- Intercepta **todas** las peticiones HTTP salientes
- Recupera token de forma **async** del Secure Storage
- Inyecta automáticamente: `Authorization: Bearer <token>`
- Si no hay token, pasa la petición sin modificar
- Manejo robusto de errores sin bloquear peticiones

**Ejemplo de cabecera inyectada:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔐 Arquitectura de Seguridad

### Antes vs Después

| Aspecto | Antes | Después |
|--------|-------|---------|
| **Token Storage** | Cookies (accesible a WebView) | Secure Storage nativo (cifrado) |
| **Persistencia** | Se pierde al cerrar app | Persiste entre reinicios |
| **Acceso Token** | Síncrono, visible | Async, aislado del navegador |
| **Interceptor HTTP** | ❌ No existe | ✅ Automático Bearer Token |
| **Inicialización** | Manual (no exista) | ✅ Automática en app.component |

---

## 🚀 Flujo de Autenticación Completo

### 1. **Arranque de la App**
```typescript
// app.component.ts (ngOnInit)
async initializeApp(): Promise<void> {
  const isAuthenticated = await this.authService.initializeAuthState();
  
  if (isAuthenticated) {
    this.router.navigate(['/tabs/home']);  // Usuario logueado
  } else {
    this.router.navigate(['/login']);      // Necesita login
  }
}
```

### 2. **Login/SignUp**
```typescript
// login.page.ts
async onSubmit() {
  await this.authService.login(email, password);
  // AuthService automáticamente:
  // - Obtiene token de Firebase
  // - Guarda token en Secure Storage
  // - Guarda userData en Preferences
  // - Actualiza currentUser$ observable
  
  this.router.navigate(['/tabs/home']);
}
```

### 3. **Peticiones HTTP**
```typescript
// auth.interceptor.ts
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  const token = await this.storageService.getToken('auth-token');
  
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next.handle(authReq);
  }
  
  return next.handle(req);
}
```

### 4. **Logout**
```typescript
// header.component o profile.page
async logout() {
  await this.authService.logout();
  // AuthService automáticamente:
  // - Limpia token del Secure Storage
  // - Limpia userData de Preferences
  // - Limpia Preferences completamente
  // - Navega a /login
}
```

---

## 🔄 Verificación de la Refactorización

### Test 1: Persistencia de Sesión
```
1. Abrir app → Login
2. Ingresar credenciales válidas
3. Navegar a Home
4. Cerrar app completamente (Android backButton + Salir)
5. Reabrir app
✅ Esperado: Debe entrar directo a Home sin pedir login
```

### Test 2: Logout Limpia la Sesión
```
1. Estar logueado en Home
2. Presionar Logout
3. Cerrar app
4. Reabrir app
✅ Esperado: Debe ir a Login (sesión fue limpiada)
```

### Test 3: Bearer Token en HTTP
```
1. Abrir DevTools (Chrome DevTools si es web)
2. Hacer una petición HTTP a la API
3. Revisar Network → Headers
✅ Esperado: Authorization: Bearer <token>
```

---

## 🛡️ Seguridad

### Token Storage
- **Ubicación:** Almacenamiento seguro nativo de Android/iOS
- **Encriptación:** Manejada por el SO
- **Acceso:** Solo la app puede acceder
- **Inaccesible desde:** JavaScript (WebView), Cookies del navegador

### Datos de Usuario
- **Ubicación:** Preferences (localStorage persistente de Capacitor)
- **Contenido:** uid, email, emailVerified (NO sensibles)
- **Nota:** No incluye contraseña ni token

### Limpiar antes de Deploy
✅ `CookieService` ya no se usa (removido de providers)
✅ Ningún dato sensible en localStorage
✅ Token siempre en Secure Storage
✅ Manejo robusto de errores

---

## 📚 Referencias de API

### StorageService
```typescript
// Token (Secure Storage)
await storageService.setToken(key, token);
const token = await storageService.getToken(key);
await storageService.removeToken(key);

// User Data (Preferences)
await storageService.setSecureData(key, userData);
const userData = await storageService.getSecureData(key);
await storageService.removeSecureData(key);
await storageService.clearSecureData();
```

### AuthService
```typescript
// Inicialización
const isAuth = await authService.initializeAuthState();

// Autenticación
await authService.login(email, password);
await authService.signUp(email, password);
await authService.logout();

// Consultas
const token = await authService.getToken();
const userData = await authService.getUser();
const isAuth = authService.isAuthenticated();
authService.getCurrentUserData();  // Observable<UserData | null>
```

---

## ⚠️ Notas Importantes

1. **Async/Await obligatorio** para `getToken()`, `getSecureData()`, etc.
2. **No usar tokens síncronamente** - siempre usar `await`
3. **El interceptor maneja tokens automáticamente** - no inyectar manualmente
4. **La inicialización es automática** en app.component - no inicializar en otros lugares
5. **Firebase SDK inyecta su propio token** para Firestore - el Bearer Token es para APIs REST customizadas

---

## 🎯 Próximos Pasos (Opcional)

1. Implementar **refresh token** si la API lo soporta
2. Agregar **token expiration check** antes de hacer peticiones
3. Implementar **logout automático** si el token expira
4. Agregar **biometric authentication** usando `@capacitor/biometrics`
5. Implementar **2FA** en login

---

## 📞 Soporte

Para reportar problemas o preguntas sobre esta refactorización:
1. Revisar console.error() en DevTools
2. Verificar que todas las promesas estén siendo `await`adas
3. Confirmar que el plugin `capacitor-secure-storage-plugin` está instalado

