// destinations-loader.js
// Charge les destinations depuis le fichier CSV et génère dynamiquement les cartes HTML

async function loadDestinations() {
    try {
        const response = await fetch('destinations.csv');
        const csvText = await response.text();
        const destinations = parseCSV(csvText);
        
        const container = document.getElementById('destinations-container');
        if (!container) {
            console.error('Container #destinations-container not found');
            return;
        }
        
        container.innerHTML = '';
        
        destinations.forEach(dest => {
            const card = createDestinationCard(dest);
            container.innerHTML += card;
        });
        
        // Charger la météo pour chaque destination après génération des cartes
        destinations.forEach(dest => {
            if (dest.latitude && dest.longitude) {
                loadWeather(dest.destination, dest.latitude, dest.longitude, dest.date_debut, dest.date_fin);
            }
        });
        
    } catch (error) {
        console.error('Erreur lors du chargement des destinations:', error);
    }
}

function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',');
    const destinations = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const dest = {};
        headers.forEach((header, index) => {
            dest[header.trim()] = values[index] ? values[index].trim() : '';
        });
        destinations.push(dest);
    }
    
    return destinations;
}

function createDestinationCard(dest) {
    const notes = dest.notes ? dest.notes.split('|').map(n => `<li>${n}</li>`).join('') : '';
    
    return `
    <div class="destination-card mb-5" data-destination="${dest.destination}">
        <div class="row g-0">
            <div class="col-md-5">
                <div class="destination-image" style="background-image: url('${dest.image_principale}');">
                    <div class="destination-badge ${dest.badge_classe}">
                        <i class="fas ${dest.badge_icone}"></i> ${dest.badge_texte}
                    </div>
                </div>
            </div>
            <div class="col-md-7">
                <div class="card-body p-4">
                    <h3 class="card-title mb-3">
                        <i class="fas fa-map-marker-alt text-danger me-2"></i>${dest.ville}, ${dest.pays}
                    </h3>
                    <div class="date-info mb-4">
                        <i class="far fa-calendar-alt me-2"></i>
                        <strong>${formatDate(dest.date_debut)}</strong> → <strong>${formatDate(dest.date_fin)}</strong>
                        <span class="badge bg-info ms-2">${dest.jours} jours / ${dest.nuits} nuits</span>
                    </div>

                    <!-- Transport -->
                    <div class="transport-section mb-4">
                        <h5 class="mb-3"><i class="fas fa-train me-2"></i>Options de Transport</h5>
                        <div class="row g-3">
                            ${createTransportOption(dest, 1)}
                            ${createTransportOption(dest, 2)}
                            ${createTransportOption(dest, 3)}
                        </div>
                    </div>

                    <!-- Accommodation -->
                    <div class="accommodation-section">
                        <h5 class="mb-3"><i class="fas fa-hotel me-2"></i>Hébergement</h5>
                        ${createAccommodationOption(dest, 1)}
                        ${createAccommodationOption(dest, 2)}
                        ${createAccommodationOption(dest, 3)}
                    </div>

                    ${notes ? `
                    <!-- Notes personnelles -->
                    <div class="personal-notes mt-4">
                        <h6 class="text-muted"><i class="fas fa-sticky-note me-2"></i>Nos notes</h6>
                        <ul class="small">
                            ${notes}
                        </ul>
                    </div>
                    ` : ''}

                    <div class="total-price mt-4">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="fs-5">Coût total estimé:</span>
                            <span class="fs-4 fw-bold text-primary">~${dest.prix_total}€ par personne</span>
                        </div>
                    </div>
                    
                    <!-- Météo estimée -->
                    <div id="meteo-${dest.destination}" class="mt-4"></div>
                </div>
            </div>
        </div>
    </div>
    `;
}

function createTransportOption(dest, num) {
    const type = dest[`transport${num}_type`];
    if (!type) return '';
    
    const icone = dest[`transport${num}_icone`];
    const nom = dest[`transport${num}_nom`];
    const prix = dest[`transport${num}_prix`];
    const depart = dest[`transport${num}_depart`];
    const arrivee = dest[`transport${num}_arrivee`];
    const retour = dest[`transport${num}_retour`];
    
    const iconColor = icone === 'fa-plane' ? 'text-primary' : 
                      icone === 'fa-train' ? 'text-success' : 
                      icone === 'fa-car' ? 'text-info' : '';
    
    return `
    <div class="col-md-6">
        <div class="transport-option">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="fw-bold"><i class="fas ${icone} ${iconColor} me-2"></i>${nom}</span>
                <span class="price-tag">${prix}€</span>
            </div>
            <small class="text-muted">
                <div>Départ: ${depart}</div>
                <div>Arrivée: ${arrivee}</div>
                ${retour ? `<div class="mt-2">Retour: ${retour}</div>` : ''}
            </small>
        </div>
    </div>
    `;
}

function createAccommodationOption(dest, num) {
    const nom = dest[`logement${num}_nom`];
    if (!nom) return '';
    
    const image = dest[`logement${num}_image`];
    const etoiles = parseFloat(dest[`logement${num}_etoiles`]);
    const description = dest[`logement${num}_description`];
    const prix = dest[`logement${num}_prix`];
    const duree = dest[`logement${num}_duree`];
    const lien = dest[`logement${num}_lien`];
    
    const stars = generateStars(etoiles);
    
    return `
    <div class="accommodation-card ${num > 1 ? 'mt-3' : ''}">
        <div class="row align-items-center">
            <div class="col-md-4">
                <img src="${image}" alt="${nom}" class="img-fluid rounded">
            </div>
            <div class="col-md-8">
                <h6 class="mt-3 mt-md-0">${nom}</h6>
                <div class="rating mb-2">
                    ${stars}
                    <span class="ms-2">${etoiles}/5</span>
                </div>
                <p class="small text-muted mb-2">${description}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="price-highlight">${prix}€ <small class="text-muted">/ ${duree}</small></span>
                    <a href="${lien}" target="_blank" class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-external-link-alt me-1"></i>Voir plus
                    </a>
                </div>
            </div>
        </div>
    </div>
    `;
}

function generateStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star text-warning"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt text-warning"></i>';
    }
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star text-warning"></i>';
    }
    
    return stars;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
}

function loadWeather(destination, latitude, longitude, startDate, endDate) {
    const meteoContainer = document.getElementById(`meteo-${destination}`);
    if (!meteoContainer) return;
    
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto`)
        .then(response => response.json())
        .then(data => {
            if (!data.daily) {
                meteoContainer.innerHTML = '<p class="small text-muted">Météo non disponible.</p>';
                return;
            }
            
            let html = '<h6 class="text-muted"><i class="fas fa-cloud-sun me-2"></i>Météo estimée</h6><ul class="small">';
            for (let i = 0; i < data.daily.time.length; i++) {
                html += `<li><strong>${formatDate(data.daily.time[i])}</strong> : ${data.daily.temperature_2m_min[i]}°C à ${data.daily.temperature_2m_max[i]}°C, Précipitations : ${data.daily.precipitation_sum[i]} mm</li>`;
            }
            html += '</ul>';
            meteoContainer.innerHTML = html;
        })
        .catch(() => {
            meteoContainer.innerHTML = '<p class="small text-muted">Erreur lors de la récupération de la météo.</p>';
        });
}

// Charger les destinations au chargement de la page
document.addEventListener('DOMContentLoaded', loadDestinations);
