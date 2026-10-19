// Les tests de dates supposent l'heure de Paris, quelle que soit la machine.
module.exports = async () => {
  process.env.TZ = 'Europe/Paris';
};
