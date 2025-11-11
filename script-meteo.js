// script-meteo.js
// Affiche la météo estimée pour Amsterdam entre le 25/12/2025 et le 28/12/2025
// Utilise l'API Open-Meteo (gratuite, sans clé)

const meteoContainer = document.getElementById('meteo-amsterdam');

const startDate = '2025-12-25';
const endDate = '2025-12-28';
const latitude = 52.3676;
const longitude = 4.9041;

fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=Europe%2FAmsterdam`)
  .then(response => response.json())
  .then(data => {
    if (!data.daily) {
      meteoContainer.innerHTML = '<p>Météo non disponible.</p>';
      return;
    }
    let html = '<h6><i class="fas fa-cloud-sun me-2"></i>Météo estimée (Amsterdam)</h6><ul class="small">';
    for (let i = 0; i < data.daily.time.length; i++) {
      html += `<li><strong>${data.daily.time[i]}</strong> : ${data.daily.temperature_2m_min[i]}°C à ${data.daily.temperature_2m_max[i]}°C, Précipitations : ${data.daily.precipitation_sum[i]} mm</li>`;
    }
    html += '</ul>';
    meteoContainer.innerHTML = html;
  })
  .catch(() => {
    meteoContainer.innerHTML = '<p>Erreur lors de la récupération de la météo.</p>';
  });
