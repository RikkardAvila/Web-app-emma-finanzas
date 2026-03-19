document.addEventListener('DOMContentLoaded', async () => {
  const isLoginPage = window.location.pathname.endsWith('login.html');

  // Verificar la sesión actual
  const { data: { session }, error } = await supabase.auth.getSession();

  // Si no hay sesión y NO estamos en login.html, redirigir al login
  if (!session && !isLoginPage) {
    window.location.replace('login.html');
    return;
  }

  // Si hay sesión y ESTAMOS en login.html, redirigir al dashboard (index.html)
  if (session && isLoginPage) {
    window.location.replace('index.html');
    return;
  }

  // Escuchar cambios de estado de autenticación (login, logout)
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' && !isLoginPage) {
      window.location.replace('login.html');
    } else if (event === 'SIGNED_IN' && isLoginPage) {
      window.location.replace('index.html');
    }
  });

  // Mostrar iniciales del usuario si estamos autenticados en cualquier página
  if (session && !isLoginPage) {
    const profileEl = document.querySelector('.profile span');
    if (profileEl) {
      const email = session.user.email;
      profileEl.textContent = email ? email.substring(0, 2).toUpperCase() : 'US';
    }

    // Bind al botón de perfil para hacer logout (temporalmente hasta tener un menú desplegable)
    const profileBtn = document.querySelector('.profile');
    if (profileBtn) {
      profileBtn.addEventListener('click', async () => {
        if(confirm('¿Deseas cerrar sesión?')) {
          await supabase.auth.signOut();
        }
      });
    }
  }
});
