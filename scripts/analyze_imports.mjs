const lagosDoctors = [
  'Fabio de Paula Lopes',
  'Stefano Pinto de Lima Zvaig',
  'Vitor Sartório Costa',
  'Erica Magalhaes dos Santos',
  'Renato Pinheiro Hilario de Souza',
  'Gustavo Andrade Lopes',
  'José Carlos Vieira Romeiro',
  'Guilherme Vieira Romeiro',
  'Victória Vieira Romeiro',
  'Joao Lucas Mota Avelino',
  'Kenedy de Almeida Alves',
  'Miriã Bertoloto de Andrade',
  'Laura Brito Fiszer Poly Ferreira',
  'Marco Aurelio Alves',
  'Karen de Souza Horta'
];

const sjmDoctors = [
  'Danielle de Souza Cortez Godfroy',
  'Fernanda Roessler Sebastiao',
  'Joao Lucas Mota Avelino',
  'Fernando Gomez Rodriguez',
  'Gabriela Fassini Vilas Boas Chagas',
  'Renata Monteiro Vieira',
  'Risla de Oliveira Gomes',
  'Kenedy de Almeida Alves',
  'Miriã Bertoloto de Andrade',
  'Laura Brito Fiszer Poly Ferreira',
  'Marco Aurelio Alves',
  'Karen de Souza Horta'
];

const mageDoctors = [
  'Laila Denise Oliveira de Andrade Kelm',
  'Wilson Vial Filho',
  'Karen de Souza Horta',
  'Marco Aurelio Alves Ferreira Filho',
  'Ana Cristina Pinheiro Leão',
  'Kenedy de Almeida Alves',
  'Miriã Bertoloto de Andrade'
];

// Note: "Marco Aurelio Alves" and "Marco Aurelio Alves Ferreira Filho" - let's check if they are the same or distinct!
const allDoctorsMap = new Map();

function addDoctor(name, unit) {
  const key = name.trim().toLowerCase();
  if (!allDoctorsMap.has(key)) {
    allDoctorsMap.set(key, { originalName: name.trim(), units: new Set() });
  }
  allDoctorsMap.get(key).units.add(unit);
}

lagosDoctors.forEach(d => addDoctor(d, 'Lagos'));
sjmDoctors.forEach(d => addDoctor(d, 'São João de Meriti'));
mageDoctors.forEach(d => addDoctor(d, 'Magé'));

console.log('=== MÉDICOS COMPARTILHADOS ENTRE UNIDADES ===');
for (const [key, val] of allDoctorsMap.entries()) {
  const units = Array.from(val.units);
  if (units.length > 1) {
    console.log(`[MULTIPLUS UNIDADES: ${units.length}] ${val.originalName} -> ${units.join(' + ')}`);
  }
}

console.log('\n=== MÉDICOS DE UMA ÚNICA UNIDADE ===');
for (const [key, val] of allDoctorsMap.entries()) {
  const units = Array.from(val.units);
  if (units.length === 1) {
    console.log(`[ÚNICA: ${units[0]}] ${val.originalName}`);
  }
}

// Users breakdown
function formatLogin(fullName) {
  const parts = fullName.trim().toLowerCase().split(/\s+/);
  const first = parts[0];
  const last = parts[parts.length - 1];
  // normalize accents
  const cleanFirst = first.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const cleanLast = last.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return `${cleanFirst}.${cleanLast}`;
}

const users = [
  // Lagos
  { name: 'Bruna Brum Goes Revelles', role: 'attendant', unit: 'Lagos' },
  { name: 'Emanoelly Ferreira Vicente', role: 'attendant', unit: 'Lagos' },
  { name: 'Ingrid Isabella Reis Costa', role: 'attendant', unit: 'Lagos' },
  { name: 'Nathalia dos Santos Teixeira', role: 'attendant', unit: 'Lagos' },
  { name: 'Raquel dos Santos Araujo', role: 'attendant', unit: 'Lagos' },
  { name: 'Tailane Mello dos Santos Baptista', role: 'attendant', unit: 'Lagos' },
  { name: 'Joana Raquel da Silva Magalhães', role: 'supervisor', unit: 'Lagos' },
  { name: 'Beatriz Soares do Rosário', role: 'supervisor', unit: 'Lagos' },

  // SJM
  { name: 'Gisele da Silva Copio', role: 'attendant', unit: 'São João de Meriti' },
  { name: 'Carla Rejane Soares Gonçalves', role: 'attendant', unit: 'São João de Meriti' },
  { name: 'Anna Jessica de Mendonça Patricio', role: 'supervisor', unit: 'São João de Meriti' },

  // Magé
  { name: 'Ana Lidia das Neves Silva Cardoso', role: 'attendant', unit: 'Magé' },
  { name: 'Andressa Diniz Santos', role: 'attendant', unit: 'Magé' },
  { name: 'Ingrid Sousa dos Santos', role: 'attendant', unit: 'Magé' },
  { name: 'Nathalia Correa Gomes', role: 'attendant', unit: 'Magé' },
  { name: 'Stephanni Raimundo Ferreira', role: 'attendant', unit: 'Magé' },
  { name: 'Veronica Fernandes Rodrigues', role: 'attendant', unit: 'Magé' },
  { name: 'Ana Paula Julia de Sales', role: 'supervisor', unit: 'Magé' },
];

console.log('\n=== USUÁRIAS (RECEPCIONISTAS E SUPERVISORAS) ===');
users.forEach(u => {
  console.log(`- ${u.name} | Perfil: ${u.role} | Unidade: ${u.unit} | Login sugerido: ${formatLogin(u.name)}`);
});
