export function getComparator(order, orderBy) {
  return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy)
}

export function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

export function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [ el, index ])
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  })
  return stabilizedThis.map((el) => el[0])
}

export function convertTimeToString(ms = 0) {
  const seconds = ms / 1000

  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
    throw new Error('Invalid input. Please provide a non-negative number of seconds.')
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  const hoursString = hours > 0 ? `${hours} hour ` : ''
  const minutesString = minutes > 0 ? `${minutes} min ` : ''
  const secondsString = remainingSeconds > 0 ? `${remainingSeconds} sec` : ''

  return `${hoursString}${minutesString}${secondsString}`.trim()
}

export const rowsInitial = []
