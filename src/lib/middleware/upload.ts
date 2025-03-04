import { NextApiRequest } from 'next'
import formidable from 'formidable'

export const handleFileUpload = async (req: NextApiRequest) => {
  const form = formidable()
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>(
    (resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        resolve({ fields, files })
      })
    }
  )
}
