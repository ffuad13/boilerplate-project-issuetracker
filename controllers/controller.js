const { genId, genDate } = require("./date&id")
const data = {}

async function CreateData(req, res) {
  try {
    const { project } = req.params
    const { issue_title, issue_text, created_by, assigned_to = "", status_text = "" } = req.body

    if (!issue_title || !issue_text || !created_by) return res.json({ error: "required field(s) is missing" })
    if (!issue_title.trim() || !issue_text.trim() || !created_by.trim())
      return res.json({ error: "required field(s) cannot be empty" })

    const payload = {
      _id: genId(),
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text,
      created_on: genDate(),
      updated_on: genDate(),
      open: true,
    }
    if (!data.hasOwnProperty(project)) {
      data[project] = [payload]
      return res.json(payload)
    }

    data[project].push(payload)
    res.json(payload)
  } catch (error) {
    res.status(500).json(error)
  }
}

async function GetData(req, res) {
  try {
    const { project } = req.params
    if (!data.hasOwnProperty(project)) return res.send({ result: "Project doesn't exist" })

    const { query } = req
    if (Object.keys(query).length === 0) return res.json(data[project])
    if (query.hasOwnProperty("open")) {
      if (query.open === "true") query.open = true
      if (query.open === "false") query.open = false
    }

    const filteredIssues = data[project].filter((issue) => {
      for (const field in query) {
        if (query[field] !== issue[field]) return false
      }
      return true
    })
    return res.json(filteredIssues)
  } catch (error) {
    res.status(500).json(error)
  }
}

async function UpdateData(req, res) {
  try {
    const { project } = req.params
    const {
      _id,
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text,
      open,
    } = req.body

    if (!_id) return res.json({ error: "_id is empty" })
    if (Object.keys(req.body).length === 1) return res.json({ error: "updated field(s) is empty", _id })
    if (!data.hasOwnProperty(project)) return res.json({ error: "project not found", project, _id })

    const findIssue = data[project].findIndex((obj) => {
      return _id === obj._id
    })
    if (findIssue < 0) return res.json({ error: "issue not found", _id })

    const updateIssue = data[project][findIssue]
		updateIssue.issue_title = issue_title || updateIssue.issue_title
		updateIssue.issue_text = issue_text || updateIssue.issue_text
		updateIssue.created_by = created_by || updateIssue.created_by
		updateIssue.assigned_to = assigned_to || updateIssue.assigned_to
		updateIssue.status_text = status_text || updateIssue.status_text
		updateIssue.open = open || updateIssue.open
		updateIssue.updated_on = genDate()

		data[project][findIssue] = updateIssue

		return res.json({result: 'update success', _id})
  } catch (error) {
    res.status(500).json(error)
  }
}

async function DeleteData(req, res) {
	try {
		const {project} = req.params
		const {_id} = req.body

		if (!_id) return res.json({error: '_id not found'})
		if (!data.hasOwnProperty(project)) return res.json({error: "Project doesn't exist" })

		const dataIssue = data[project].findIndex((obj) => obj._id === _id)
		if (dataIssue < 0) return res.json({error: 'delete failed', _id})

		data[project].splice(dataIssue, 1)
		return res.json({result: 'success delete', _id})
	} catch (error) {
    res.status(500).json(error)
	}
}

module.exports = { GetData, CreateData, UpdateData, DeleteData }
