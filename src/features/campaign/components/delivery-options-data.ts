const REAL_NAMES = [
  'Cody Fisher', 'Bessie Cooper', 'Brooklyn Simmons', 'Devon Lane', 'Jenny Wilson',
  'Robert Fox', 'Jane Cooper', 'Wade Warren', 'Esther Howard', 'Cameron Williamson',
  'Leslie Alexander', 'Kristin Watson', 'Albert Flores', 'Marvin McKinney', 'Jacob Jones',
  'Theresa Webb', 'Kathryn Murphy', 'Ralph Edwards', 'Floyd Miles', 'Eleanor Pena',
  'Annette Black', 'Darrell Steward', 'Guy Hawkins', 'Arlene McCoy', 'Dianne Russell',
  'Courtney Henry', 'Darlene Robertson', 'Savannah Nguyen', 'Ronald Richards', 'Jerome Bell',
]

export const BUYER_SUGGESTIONS = Array.from({ length: 120 }, (_, index) => {
  const name = REAL_NAMES[index % REAL_NAMES.length]
  const suffix = Math.floor(index / REAL_NAMES.length) + 1

  return {
    value: `buyer-${index + 1}`,
    label: suffix > 1 ? `${name} ${suffix}` : name,
  }
})

export function getBuyerWarning(id: string): string | undefined {
  return id === 'devon-lane'
    ? "This client doesn't have eligible client campaigns to receive leads yet."
    : undefined
}
