import re

# PATCH HTML
html_path = 'dashboard.component.html'
with open(html_path, 'r') as f:
    html = f.read()

# remove navegação
html = re.sub(r'<!-- Navegação Rápida -->\s*<section class="navegacao-section">.*?</section>', '', html, flags=re.DOTALL)
with open(html_path, 'w') as f:
    f.write(html)


# PATCH SCSS
scss_path = 'dashboard.component.scss'
with open(scss_path, 'r') as f:
    scss = f.read()

# Remove old `.navegacao-section`, `.nav-card`, etc
scss = re.sub(r'\n// Cards de Navegação\n\.navegacao-section {.*?(?=\n// Alertas de Contratos)', '\n', scss, flags=re.DOTALL)

# Re-write `.dashboard-main-grid` completely
main_grid = """// DASHBOARD MAIN GRID
.dashboard-main-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-6);
  align-items: start;

  > .metricas-section {
    grid-column: 1 / -1;
    grid-row: 1;
  }

  > .clientes-section {
    grid-column: 1 / 3;
    grid-row: 2;
  }

  > .ranking-section {
    grid-column: 3 / -1;
    grid-row: 2;
  }

  > .alertas-section {
    grid-column: 1 / -1;
    grid-row: 3;
  }
}

// Override sub-grids to fit naturally within the main grid
.metricas-grid {
  display: grid !important;
  grid-template-columns: repeat(4, 1fr) !important;
  gap: var(--space-4) !important;
}

.clientes-grid, .ranking-grid {
  display: flex !important;
  flex-direction: column !important;
  gap: var(--space-4) !important;
}

@media (max-width: 1024px) {
  .dashboard-main-grid {
    grid-template-columns: 1fr;
  }
  .dashboard-main-grid > .metricas-section,
  .dashboard-main-grid > .clientes-section,
  .dashboard-main-grid > .ranking-section,
  .dashboard-main-grid > .alertas-section {
    grid-column: 1 / -1;
    grid-row: auto;
  }
  .metricas-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 640px) {
  .metricas-grid {
    grid-template-columns: 1fr !important;
  }
}"""

scss = re.sub(r'// DASHBOARD MAIN GRID.*?@media \(max-width: 1024px\) \{.*?(?=\n\.icon \{)', main_grid, scss, flags=re.DOTALL)

# Fix double media queries logic if regex missed something
scss = re.sub(r'\.cards-grid, \.ranking-grid \{\s*grid-template-columns: 1fr !important;\s*\}\s*\}', '}', scss)

with open(scss_path, 'w') as f:
    f.write(scss)


# PATCH TS
ts_path = 'dashboard.component.ts'
with open(ts_path, 'r') as f:
    ts = f.read()

# remove cards = computed
ts = re.sub(r'// Cards com dados dinâmicos\s*cards = computed\(\(\) => \[.*?\n  \]\);\n', '', ts, flags=re.DOTALL)

with open(ts_path, 'w') as f:
    f.write(ts)

