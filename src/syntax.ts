import { decode } from "html-entities"

/**
 * @param {string} htmlCode
 */
export function htmlToJson(
  htmlCode: string,
  removeComments: boolean
): { text: string; color?: string }[] {
  const originalCode = htmlCode
  /**
   * @type {{text: string, color?: string}[]}
   */
  const data: { text: string; color?: string }[] = []
  const elementRegex = /^<span\s+class="hljs-([^"]+)"[^>]*>([^<]*)(?:<\/span>)?/
  const nonelementRegex = /[^<]*/
  while (htmlCode) {
    const match = htmlCode.match(elementRegex)
    if (match) {
      const fullText = match[0]
      const cls = match[1]
      const text = match[2]
      let color = "black"
      // const color = cls;
      const type = cls.split(" ")[0].toLowerCase() ?? "unknown"
      switch (type) {
        case "comment":
          color = "#697070"
          break
        case "punctuation":
        case "tag":
          color = "#444a"
          break
        case "attribute":
        case "doctag":
        case "keyword":
        case "meta":
        case "keyword":
        case "name":
        case "selector-tag":
          color = "#32a2cb"
          break
        case "deletion":
        case "number":
        case "quote":
        case "selector-class":
        case "selector-id":
        case "string":
        case "template-tag":
        case "type":
        case "section":
        case "title":
          color = "#800"
          break
        case "link":
        case "operator":
        case "regexp":
        case "selector-attr":
        case "selector-pseudo":
        case "symbol":
        case "template-variable":
        case "variable":
          color = "#ab5656"
          break
        case "literal":
          color = "#695"
          break
        case "addition":
        case "built_in":
        case "bullet":
        case "code":
          color = "#397300"
          break
        case "meta":
          color = "#1f7199"
          break
        case "string":
          color = "#38a"
          break
      }
      // console.log({ type, text, color, fullText });
      data.push({ text: decode(text), color })
      htmlCode = htmlCode.slice(fullText.length)
    } else if (htmlCode.startsWith("</span>")) {
      // Failed ending from hljs
      const text = "</span>"
      data.push({ text: "" }) // Empty text on purpose
      htmlCode = htmlCode.slice(text.length)
    } else if (htmlCode.startsWith("\n")) {
      const text = "\n"
      htmlCode = htmlCode.slice(1)
      data.push({ text })
    } else {
      const match = htmlCode.match(nonelementRegex)
      const text = match![0]
      htmlCode = htmlCode.slice(text.length)
      data.push({ text: decode(text) })
    }
  }

  /**
   * @type {{text: string, color?: string}[]}
   */
  const fixedData: { text: string; color?: string }[] = []

  // BUG: REMOVE COMMENTS not working properly
  // TODO: Remove new lines if removeNewLines is true
  // Fix newlines and remove comments
  let skipLine = false
  for (let i = 0; i < data.length; i++) {
    const { text, color } = data[i]
    const lines = text.split("\n")

    for (let j = 0; j < lines.length; j++) {
      const line = lines[j]

      // Skip the current line if a comment was encountered and removeComments is true
      if (removeComments && skipLine) {
        skipLine = false
        if (j !== lines.length - 1) {
          // Don't skip if it's the last element (which is usually empty after split)
          continue
        }
      }

      // Mark for skipping the next line if a comment is encountered
      if (color === "#697070") {
        // assuming color '#697070' indicates comments
        skipLine = true
      }

      if (j > 0) fixedData.push({ text: "\n" })

      fixedData.push({ text: line, color })
    }
  }

  return fixedData
}