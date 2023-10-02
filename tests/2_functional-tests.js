const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const path = "/api/issues/apitest"
const payload = {
  issue_title: "Refactoring",
  issue_text: "Refactoring services for performance.",
  created_by: "Fulani",
  assigned_to: "Fulan",
  status_text: "In Progress",
};
const fields = [
  "_id",
  "issue_title",
  "issue_text",
  "assigned_to",
  "status_text",
  "created_by",
  "created_on",
  "updated_on",
  "open",
];


suite('Functional Tests', function() {
	let _id;
	test('Create an issue with every field', (done)=> {
		chai.request(server).post(path).send(payload).end((err, res) => {
			const {body} = res
			_id = body._id
			assert.equal(res.status, 200)
			assert.isObject(body)
			assert.include(body, payload)
			assert.containsAllKeys(body, ['_id', 'created_on', 'updated_on', 'open'])
			done()
		})
	})

	test('Create an issue with only required fields', (done) => {
		const {issue_title, issue_text, created_by} = payload
		chai.request(server).post(path).send({issue_title, issue_text, created_by}).end((err, res) => {
			const {body} = res
			assert.equal(res.status, 200)
			assert.isObject(body)
			assert.equal(body.issue_title, issue_title)
			assert.equal(body.issue_text, issue_text)
			assert.equal(body.created_by, created_by)
			assert.equal(body.open, true)
			assert.equal(body.status_text, "")
			assert.containsAllKeys(body, ['_id', 'created_on', 'updated_on'])
			done()
		})
	})

	test('Create an issue with missing required fields', (done) => {
		const {assigned_to, status_text} = payload
		chai.request(server).post(path).send({assigned_to, status_text}).end((err, res) => {
			const {body} = res
			assert.equal(res.status, 200)
			assert.isObject(body)
			assert.deepEqual(body, {error: 'required field(s) is missing'})
			done()
		})
	})

	test('View issues on a project', (done) => {
		chai.request(server).get(path).end((err, res) => {
			const {body} = res
			assert.equal(res.status, 200)
			assert.isArray(body)
			assert.equal(body.length, 2)
			body.forEach((issue) => {
				assert.containsAllKeys(issue, fields)
			})
			done()
		})
	})

	test('View issues on a project with one filter', (done) => {
		chai.request(server).get(`${path}?created_by=fulani`).end((err, res) => {
			const {body} = res
			assert.equal(res.status, 200)
			assert.isArray(body)
			body.forEach((issue) => assert.equal(issue.created_by, 'fulani'))
			done()
		})
	})

	test('View issues on a project with multiple filters', (done) => {
		chai.request(server).get(`${path}?created_by=fulan&assigned_to=fulan`).end((err, res) => {
			const {body} = res
			assert.equal(res.status, 200)
			assert.isArray(body)
			body.forEach((issue) => {
				assert.equal(issue.created_by, 'fulani')
				assert.equal(issue.assigned_to, 'fulan')
			})
			done()
		})
	})

	test('Update one field on an issue', (done) => {
		chai.request(server).put(path).send({_id, created_by: 'Jafunk'}).end((err, res) => {
			const {body} = res
			assert.equal(res.status, 200)
			assert.isObject(body)
			assert.deepEqual(body, {result: 'update success', _id})
			done()
		})
	})

	test('Update multiple fields on an issue', (done) => {
		chai.request(server).put(path).send({_id, created_by: 'Jafunk', issue_title: 'changelog', issue_text: 'change'}).end((err, res) => {
			const {body} = res
			assert.equal(res.status, 200)
			assert.isObject(body)
			assert.deepEqual(body, {result: 'update success', _id})
			done()
		})
	})

	test('Update an issue with missing _id', (done) => {
		chai.request(server).put(path).send({issue_title: 'changelog'}).end((err, res) => {
			const {body} = res
			assert.equal(res.status, 200)
			assert.isObject(body)
			assert.deepEqual(body, {error: '_id is empty'})
			done()
		})
	})

	test('Update an issue with no fields to update', (done) => {
		chai.request(server).put(path).send({_id}).end((err, res) => {
			const {body} = res
			assert.equal(res.status, 200)
			assert.isObject(body)
			assert.deepEqual(body, {error: "updated field(s) is empty", _id})
			done()
		})
	})

	test('Update an issue with an invalid _id', (done) => {
		chai.request(server).put(path).send({_id: 'wrong-7ydg7674-id', issue_title: 'wrong'}).end((err, res) => {
			const {body} = res
			assert.equal(res.status, 200)
			assert.isObject(body)
			assert.deepEqual(body, {error: "issue not found", _id: 'wrong-7ydg7674-id'})
			done()
		})
	})

	test('Delete an issue', (done) => {
		chai.request(server).delete(path).send({_id}).end((err, res) => {
			const {body} = res
			assert.equal(res.status, 200)
			assert.isObject(body)
			assert.deepEqual(body, {result: 'success delete', _id})
			done()
		})
	})

	test('Delete an issue with an invalid _id', (done) => {
		chai.request(server).delete(path).send({_id: 'wrong-7ydg7674-id'}).end((err, res) => {
			const {body} = res
			assert.equal(res.status, 200)
			assert.isObject(body)
			assert.deepEqual(body, {error: 'delete failed', _id: 'wrong-7ydg7674-id'})
			done()
		})
	})

	test('Delete an issue with missing _id', (done) => {
		chai.request(server).delete(path).send({}).end((err, res) => {
			const {body} = res
			assert.equal(res.status, 200)
			assert.isObject(body)
			assert.deepEqual(body, {error: '_id not found'})
			done()
		})
	})
});
