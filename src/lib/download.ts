/** Hand a string to the browser as a file. Used to let people take away an
    example file and see the format for themselves. */
export const downloadText = (fileName: string, text: string) => {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
