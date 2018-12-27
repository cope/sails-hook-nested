const expect = require('chai').expect;
const Sails = require('sails').Sails;

describe('sails.hook.nested', () => {

	// Var to hold a running sails app instance
	let sails;

	// Before running any tests, attempt to lift Sails
	before(function (done) {

		// Hook will timeout in 10 seconds
		this.timeout(10000);

		// Attempt to lift sails
		Sails().lift({
			hooks: {
				'nested': require('../'),
				'grunt': false
			},
			log: {
				level: 'error'
			}
		}, (err, _sails) => {
			if (err) {
				return done(err);
			}
			sails = _sails;
			return done();
		});
	});

	// After tests are complete, lower Sails
	after(function (done) {
		// Lower Sails (if it successfully lifted)
		if (sails) {
			return sails.lower(done);
		}

		// Otherwise just return
		return done();
	});

	it('should not crash sails on bootstrap', () => true);

	it('should be accesible in sails.hooks', () => {
		expect(sails.hooks).to.have.ownProperty('nested');
	});

	it('should be an object', () => {
		expect(sails.hooks.nested).to.be.an.instanceof(Object);
	});

});