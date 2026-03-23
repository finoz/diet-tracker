<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="header-inner">
        <h1 class="app-title">dieta <em>settimanale</em></h1>
        <span class="app-subtitle">Francesco Finotto</span>
      </div>
    </header>
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style lang="scss" scoped>
@use 'helpers' as *;

.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  border-bottom: 1px solid var(--cream-dark);
  padding: 1.25rem 2rem;
  background: var(--cream);
  position: sticky;
  top: 0;
  z-index: 10;

  @include respond-to('sm') {
    padding: 0.875rem 1rem;
  }
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: baseline;
  gap: 1rem;
}

.app-title {
  font-size: 1.5rem;
  color: var(--ink);

  em {
    color: var(--accent);
    font-style: italic;
  }

  @include respond-to('sm') {
    font-size: 1.25rem;
  }
}

.app-subtitle {
  font-size: 0.8rem;
  color: var(--ink-muted);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.app-main {
  flex: 1;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem;

  @include respond-to('md') {
    padding: 1.25rem 1rem;
  }

  @include respond-to('sm') {
    padding: 1rem 0.75rem;
  }
}
</style>
