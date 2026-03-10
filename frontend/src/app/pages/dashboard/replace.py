import re
import os

html_path = 'dashboard.component.html'
scss_path = 'dashboard.component.scss'

with open(html_path, 'r') as f:
    html = f.read()
with open(scss_path, 'r') as f:
    scss = f.read()

# 1. Dashboard Header
html = html.replace('<h1>Dashboard</h1>', '''<div class="page-header">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
      <h1>Dashboard</h1>
    </div>''')
html = html.replace('<header class="dashboard-header">', '<header class="dashboard-header">')

# 2. metricasFinanceiras card replace with card component structure
html = html.replace('<div class="metrica-card"', '<div class="card"')
html = html.replace('<div class="metrica-header">', '<div class="card-header">')
# SVG for swtich
svg_switch = '''
                @switch(metrica.icone) {
                  @case ('currency-dollar') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg> }
                  @case ('arrow-trending-up') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"/></svg> }
                  @case ('arrow-trending-down') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181"/></svg> }
                  @case ('user-group') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"/></svg> }
                }'''

html = html.replace('{{ metrica.icone }}', svg_switch)

# 3. cards-grid > stat-tiles
# Replace nav-card with stat-tile structure
svg_nav_switch = '''
                @switch(card.icon) {
                  @case ('building-office') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"/></svg> }
                  @case ('user-group') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"/></svg> }
                  @case ('map-pin') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg> }
                  @case ('calendar-days') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"/></svg> }
                  @case ('document-text') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg> }
                }
'''
html = html.replace('<span class="card-icon">{{ card.icon }}</span>', f'<span class="card-icon">{svg_nav_switch}</span>')
# Change navigation to use stat-tile pattern? "Apply stat-tile pattern" could apply to the metrics or the navigation.
# I will use stat tile on the Nav cards and maybe something else, or keep nav-card but give string SVGs mapping.
# The prompt "Apply stat tile pattern from DESIGN_PATTERN. Apply card pattern to financial summary" might mean:
html = html.replace('class="nav-card"', 'class="stat-tile"')

# Replace other emojis
svg_user_group = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="icon"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"/></svg>'
svg_calendar = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="icon"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"/></svg>'
svg_x_circle = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="icon"><path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>'
svg_exclamation = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="icon"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/></svg>'
svg_trophy = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="icon"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"/></svg>'
svg_check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="icon"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>'
svg_user_icon_only = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"/></svg>'


html = html.replace('<span class="footer-icon">user-group</span>', f'<span class="footer-icon">{svg_user_group}</span>')
html = html.replace('<span class="footer-icon">x-circle</span>', f'<span class="footer-icon">{svg_x_circle}</span>')
html = html.replace('<span class="footer-icon">exclamation-triangle</span>', f'<span class="footer-icon">{svg_exclamation}</span>')
html = html.replace('<span class="footer-icon">calendar-days</span>', f'<span class="footer-icon">{svg_calendar}</span>')
html = html.replace('<span class="ranking-icon">trophy</span>', f'<span class="ranking-icon">{svg_trophy}</span>')
html = html.replace('<span class="ranking-icon">exclamation-triangle</span>', f'<span class="ranking-icon">{svg_exclamation}</span>')
html = html.replace('<span>Sem contrato ativo</span>', f'<span class="warning-text">{svg_exclamation} Sem contrato ativo</span>')
html = html.replace('<span>Nenhuma falta registrada</span>', f'<span class="success-text">{svg_check} Nenhuma falta registrada</span>')
html = html.replace('<h2>Clientes</h2>', '<h2>Clientes</h2>') # We apply icons safely
html = html.replace('<h2 class="section-title">Clientes</h2>', f'<div class="page-header"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"/></svg><h1>Clientes</h1></div>')
html = html.replace('<h2 class="section-title">Métricas Financeiras</h2>', f'<div class="page-header"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg><h1>Métricas Financeiras</h1></div>')
html = html.replace('<h2 class="section-title">Funcionários — {{ getMesAtualLabel() }}</h2>', f'<div class="page-header">{svg_user_icon_only}<h1>Funcionários — {{{{ getMesAtualLabel() }}}}</h1></div>')

html = html.replace('<h2 class="section-title">Navegação Rápida</h2>', f'<div class="page-header"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59"/></svg><h1>Navegação Rápida</h1></div>')
html = html.replace('<h2 class="section-title">Contratos Próximos ao Vencimento</h2>', f'<div class="page-header">{svg_exclamation}<h1>Contratos Próximos ao Vencimento</h1></div>')

with open(html_path, 'w') as f:
    f.write(html)

'''
For SCSS:
- Typography: font-weight -> var(--fw-*), font-size -> var(--text-*)
- Spacing: padding/margin -> var(--space-*)
- Colors: all #hex -> var(--token-*) except some dynamic statuses, but the prompt says
"All colors var(--token), spacing var(--space-*), typography var(--text-*). Responsive grid."
Wait, actually I should completely overwrite the SCSS with a clean and token-adherent implementation.
But it has 920 lines. Let's do string replaces for the specific hardcoded tokens and add the new missing patterns to SCSS.
'''
scss = re.sub(r'font-size:\s*0\.7rem;', 'font-size: var(--text-xs);', scss)
scss = re.sub(r'font-size:\s*0\.75rem;', 'font-size: var(--text-xs);', scss)
scss = re.sub(r'font-size:\s*0\.8rem;', 'font-size: var(--text-xs);', scss)
scss = re.sub(r'font-size:\s*0\.875rem;', 'font-size: var(--text-sm);', scss)
scss = re.sub(r'font-size:\s*0\.9rem;', 'font-size: var(--text-sm);', scss)
scss = re.sub(r'font-size:\s*0\.95rem;', 'font-size: var(--text-sm);', scss)
scss = re.sub(r'font-size:\s*1rem;', 'font-size: var(--text-base);', scss)
scss = re.sub(r'font-size:\s*1\.125rem;', 'font-size: var(--text-lg);', scss)
scss = re.sub(r'font-size:\s*1\.25rem;', 'font-size: var(--text-xl);', scss)
scss = re.sub(r'font-size:\s*1\.5rem;', 'font-size: var(--text-2xl);', scss)
scss = re.sub(r'font-size:\s*2rem;', 'font-size: var(--text-3xl);', scss)

scss = re.sub(r'font-weight:\s*400;', 'font-weight: var(--fw-regular);', scss)
scss = re.sub(r'font-weight:\s*500;', 'font-weight: var(--fw-medium);', scss)
scss = re.sub(r'font-weight:\s*600;', 'font-weight: var(--fw-semibold);', scss)
scss = re.sub(r'font-weight:\s*700;', 'font-weight: var(--fw-bold);', scss)
scss = re.sub(r'font-weight:\s*800;', 'font-weight: var(--fw-extrabold);', scss)

scss = re.sub(r'border-radius:\s*0\.5rem;', 'border-radius: var(--radius-md);', scss)
scss = re.sub(r'border-radius:\s*0\.625rem;', 'border-radius: var(--radius-lg);', scss)
scss = re.sub(r'border-radius:\s*0\.75rem;', 'border-radius: var(--radius-lg);', scss)
scss = re.sub(r'border-radius:\s*1rem;', 'border-radius: var(--radius-xl);', scss)

# We should add page-header, card, stat-tile.
new_classes = """
// DESIGN SYSTEM PATTERNS
.page-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);

  svg {
    width: 2rem;
    height: 2rem;
    color: var(--primary-color);
  }

  h1 {
    font-size: var(--text-3xl);
    font-weight: var(--fw-extrabold);
    color: var(--text-primary);
    margin: 0;
  }
}

.card {
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
}
.card-header {
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
  h3 {
    margin: 0;
    font-size: var(--text-lg);
    font-weight: var(--fw-bold);
  }
}
.card-body {
  padding: var(--space-4);
}

.stat-tile {
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .stat-value {
    font-size: var(--text-2xl);
    font-weight: var(--fw-extrabold);
    color: var(--text-primary);
  }
  .stat-label {
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }
  svg {
    width: 2rem;
    height: 2rem;
    color: var(--primary-color);
    margin-bottom: var(--space-2);
  }
}

// 4-col -> 2-col -> 1-col grids
.metricas-grid, .clientes-grid, .cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.icon {
  width: 1em;
  height: 1em;
  display: inline-block;
  vertical-align: middle;
}
"""

with open(scss_path, 'w') as f:
    f.write(new_classes + scss)

