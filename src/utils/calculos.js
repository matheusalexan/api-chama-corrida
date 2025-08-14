/**
 * Utilitários para cálculos de distância e preço
 * Implementa as regras de negócio RN-06 (cálculo de preço estimado)
 */

/**
 * Calcula a distância entre duas coordenadas usando a fórmula de Haversine
 * @param {number} lat1 - Latitude do ponto 1
 * @param {number} lng1 - Longitude do ponto 1
 * @param {number} lat2 - Latitude do ponto 2
 * @param {number} lng2 - Longitude do ponto 2
 * @returns {number} Distância em quilômetros
 */
export function calcularDistanciaHaversine(lat1, lng1, lat2, lng2) {
  const R = 6371; // Raio da Terra em quilômetros
  
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Calcula o tempo estimado da viagem baseado na distância
 * @param {number} distanciaKm - Distância em quilômetros
 * @returns {number} Tempo estimado em minutos
 */
export function calcularTempoEstimado(distanciaKm) {
  const velocidadeMedia = 25; // km/h conforme RN-06
  return (distanciaKm / velocidadeMedia) * 60; // Convertendo para minutos
}

/**
 * Calcula o preço estimado da corrida conforme RN-06
 * @param {number} origemLat - Latitude da origem
 * @param {number} origemLng - Longitude da origem
 * @param {number} destinoLat - Latitude do destino
 * @param {number} destinoLng - Longitude do destino
 * @param {string} categoria - Categoria da corrida (ECONOMY ou COMFORT)
 * @returns {number} Preço estimado com 2 casas decimais
 */
export function calcularPrecoEstimado(origemLat, origemLng, destinoLat, destinoLng, categoria) {
  // Validação das coordenadas conforme RN-03
  if (origemLat === destinoLat && origemLng === destinoLng) {
    throw new Error('Origem e destino não podem ser iguais');
  }
  
  if (origemLat < -90 || origemLat > 90 || destinoLat < -90 || destinoLat > 90) {
    throw new Error('Latitude deve estar entre -90 e 90');
  }
  
  if (origemLng < -180 || origemLng > 180 || destinoLng < -180 || destinoLng > 180) {
    throw new Error('Longitude deve estar entre -180 e 180');
  }
  
  // Validação da categoria conforme RN-04
  if (!['ECONOMY', 'COMFORT'].includes(categoria)) {
    throw new Error('Categoria deve ser ECONOMY ou COMFORT');
  }
  
  // Cálculo da distância
  const distanciaKm = calcularDistanciaHaversine(origemLat, origemLng, destinoLat, destinoLng);
  
  // Cálculo do tempo estimado
  const tempoMinutos = calcularTempoEstimado(distanciaKm);
  
  // Tarifas conforme RN-06
  const tarifaBase = 3.0;
  const tarifaPorKm = 1.8;
  const tarifaPorMin = 0.5;
  
  // Cálculo do preço base
  let precoBase = tarifaBase + (distanciaKm * tarifaPorKm) + (tempoMinutos * tarifaPorMin);
  
  // Multiplicador por categoria conforme RN-06
  const multiplicador = categoria === 'COMFORT' ? 1.3 : 1.0;
  precoBase *= multiplicador;
  
  // Retorna com 2 casas decimais
  return Math.round(precoBase * 100) / 100;
}

/**
 * Valida se as coordenadas são válidas
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} True se as coordenadas são válidas
 */
export function validarCoordenadas(lat, lng) {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Valida se a origem é diferente do destino
 * @param {number} origemLat - Latitude da origem
 * @param {number} origemLng - Longitude da origem
 * @param {number} destinoLat - Latitude do destino
 * @param {number} destinoLng - Longitude do destino
 * @returns {boolean} True se origem e destino são diferentes
 */
export function validarOrigemDestinoDiferentes(origemLat, origemLng, destinoLat, destinoLng) {
  return !(origemLat === destinoLat && origemLng === destinoLng);
} 