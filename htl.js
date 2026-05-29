document.addEventListener('DOMContentLoaded', () => {
  // ===== THEME TOGGLE =====
  const themeToggle = document.getElementById('theme-toggle');
  const themeButtons = document.querySelectorAll('.theme-color');
  const body = document.body;
  const themeClasses = ['theme-sky', 'theme-emerald', 'theme-rose', 'theme-white'];

  const storedTheme = localStorage.getItem('htl-theme');
  const storedAccent = localStorage.getItem('htl-accent');

  if (storedTheme === 'dark') {
    body.classList.add('dark-theme');
  } else {
    body.classList.add('light-theme');
  }

  if (storedAccent && themeClasses.includes(storedAccent)) {
    themeClasses.forEach((theme) => body.classList.remove(theme));
    body.classList.add(storedAccent);
  }

  themeButtons.forEach((button) => {
    if (button.dataset.theme === storedAccent) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });

  const updateToggleLabel = () => {
    if (!themeToggle) return;
    themeToggle.textContent = body.classList.contains('dark-theme') ? '☀️ Mode Terang' : '🌙 Mode Gelap';
  };

  updateToggleLabel();

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = body.classList.contains('dark-theme');
      if (isDark) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        localStorage.setItem('htl-theme', 'light');
      } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        localStorage.setItem('htl-theme', 'dark');
      }
      updateToggleLabel();
    });
  }

  themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      themeClasses.forEach((theme) => body.classList.remove(theme));
      themeButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      body.classList.add(button.dataset.theme);
      localStorage.setItem('htl-accent', button.dataset.theme);
    });
  });

  // ===== REVEAL ANIMATION =====
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach((element) => revealObserver.observe(element));

  // ===== COUNTER ANIMATION =====
  const counters = document.querySelectorAll('.stat-number');
  const animateCounter = (element) => {
    const target = Number(element.dataset.target) || 0;
    const suffix = element.dataset.suffix || '';
    let current = 0;
    const increment = Math.max(1, Math.ceil(target / 100));

    const update = () => {
      current += increment;
      if (current >= target) {
        element.textContent = `${target}${suffix}`;
      } else {
        element.textContent = `${current}${suffix}`;
        requestAnimationFrame(update);
      }
    };

    update();
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
        entry.target.classList.add('animated');
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach((counter) => counterObserver.observe(counter));

  // ===== DATA TABLE FILTERING =====
  window.filterTable = function(tableId) {
    document.querySelectorAll('.data-table').forEach(table => {
      table.style.display = 'none';
    });
    document.getElementById(tableId).style.display = 'table';

    document.querySelectorAll('.data-filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const selector = `.data-filter-btn[onclick="filterTable('${tableId}')"]`;
    const btn = document.querySelector(selector);
    if (btn) {
      btn.classList.add('active');
    }
  };

  const renderTradingViewCandlestick = (period = '6m') => {
    const container = document.getElementById('tradingview_candle_chart');
    if (!container || typeof TradingView === 'undefined') return;
    container.innerHTML = '';

    const rangeMap = {
      '1m': '1M',
      '3m': '3M',
      '6m': '6M',
      '1y': '1Y'
    };
    const selectedRange = rangeMap[period] || '6M';

    new TradingView.widget({
      autosize: true,
      symbol: 'FX_IDC:USDIDR',
      interval: 'D',
      timezone: 'Asia/Jakarta',
      theme: 'dark',
      style: '1',
      locale: 'en',
      toolbar_bg: '#0F172A',
      hide_side_toolbar: false,
      allow_symbol_change: false,
      container_id: 'tradingview_candle_chart',
      range: selectedRange
    });
  };

  const getPdbData = (period) => {
    if (period === 'annual') {
      return {
        labels: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'],
        data: [5.03, 5.07, 5.17, 5.02, 3.69, 3.69, 5.31, 5.05],
        label: 'Pertumbuhan PDB Tahunan (%)'
      };
    }

    return {
      labels: ['Q1 2022', 'Q2 2022', 'Q3 2022', 'Q4 2022', 'Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023'],
      data: [5.01, 5.44, 6.06, 5.31, 5.03, 5.17, 4.94, 5.05],
      label: 'Pertumbuhan PDB Kuartalan (%)'
    };
  };

  let pdbChart = null;
  const renderPdbChart = (period = 'quarter') => {
    const pdbCtx = document.getElementById('pdbChart');
    if (!pdbCtx) return;
    const { labels, data, label } = getPdbData(period);
    if (pdbChart) pdbChart.destroy();

    pdbChart = new Chart(pdbCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label,
          data,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.15)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#2563eb',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text') }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary'),
              callback: (value) => value + '%'
            },
            grid: { color: 'rgba(59, 130, 246, 0.05)' }
          },
          x: {
            ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') },
            grid: { color: 'rgba(59, 130, 246, 0.05)' }
          }
        }
      }
    });
  };

  let inflationChart = null;
  const renderInflationChart = (type = 'line') => {
    const inflationCtx = document.getElementById('inflationChart');
    if (!inflationCtx) return;
    if (inflationChart) inflationChart.destroy();

    const isLine = type === 'line';

    inflationChart = new Chart(inflationCtx, {
      type: isLine ? 'line' : 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei'],
        datasets: [
          {
            label: 'Inflasi Aktual (%)',
            data: [3.63, 3.32, 3.01, 2.98, 3.12],
            borderColor: '#ef4444',
            backgroundColor: isLine ? 'rgba(239, 68, 68, 0.15)' : '#ef4444',
            borderWidth: 2,
            fill: isLine,
            borderRadius: 8,
            pointRadius: 4,
            pointBackgroundColor: '#ef4444'
          },
          {
            label: 'Target BI Min (%)',
            data: [2.0, 2.0, 2.0, 2.0, 2.0],
            type: 'line',
            borderColor: '#10b981',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: '#10b981'
          },
          {
            label: 'Target BI Max (%)',
            data: [4.0, 4.0, 4.0, 4.0, 4.0],
            type: 'line',
            borderColor: '#f59e0b',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 4,
            pointBackgroundColor: '#f59e0b'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text') }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
            ticks: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary'),
              callback: (value) => value + '%'
            },
            grid: { color: 'rgba(59, 130, 246, 0.05)' }
          },
          x: {
            ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') },
            grid: { color: 'rgba(59, 130, 246, 0.05)' }
          }
        }
      }
    });
  };

  let sectorChart = null;
  const renderSectorChart = (type = 'doughnut') => {
    const sectorCtx = document.getElementById('sectorChart');
    if (!sectorCtx) return;
    if (sectorChart) sectorChart.destroy();

    sectorChart = new Chart(sectorCtx, {
      type,
      data: {
        labels: ['Pertanian', 'Manufaktur', 'Perdagangan', 'Keuangan', 'Transportasi', 'Pariwisata', 'Lainnya'],
        datasets: [{
          data: [13.7, 19.6, 12.4, 8.2, 6.5, 3.8, 35.8],
          backgroundColor: ['#10b981', '#2563eb', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', 'rgba(59, 130, 246, 0.3)'],
          borderWidth: 2,
          borderColor: getComputedStyle(document.documentElement).getPropertyValue('--surface')
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--text'),
              padding: 20
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => context.label + ': ' + context.parsed + '%'
            }
          }
        }
      }
    });
  };

  const candlestickButtons = document.querySelectorAll('#candlestick-range-buttons .filter-btn');
  candlestickButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      candlestickButtons.forEach((button) => button.classList.remove('active'));
      btn.classList.add('active');
      renderTradingViewCandlestick(btn.dataset.period);
    });
  });

  const pdbButtons = document.querySelectorAll('#pdb-range-buttons .filter-btn');
  pdbButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      pdbButtons.forEach((button) => button.classList.remove('active'));
      btn.classList.add('active');
      renderPdbChart(btn.dataset.period);
    });
  });

  const inflationButtons = document.querySelectorAll('#inflation-display-buttons .filter-btn');
  inflationButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      inflationButtons.forEach((button) => button.classList.remove('active'));
      btn.classList.add('active');
      renderInflationChart(btn.dataset.type);
    });
  });

  const sectorButtons = document.querySelectorAll('#sector-display-buttons .filter-btn');
  sectorButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      sectorButtons.forEach((button) => button.classList.remove('active'));
      btn.classList.add('active');
      renderSectorChart(btn.dataset.type);
    });
  });

  // ===== CHARTS INITIALIZATION =====
  initCharts();
  renderTradingViewCandlestick('6m');
  renderPdbChart('quarter');
  renderInflationChart('line');
  renderSectorChart('doughnut');
});

function initCharts() {
  Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary');
  Chart.defaults.borderColor = 'rgba(59, 130, 246, 0.1)';
}
