const _ = require('lodash');
const {Validator, Rule} = require('@cesium133/forgjs');

const hasPlainObject = (o) => !!_.findKey(o, _.isPlainObject);
const forgify = (o) => {
	let keys = _.keys(o);
	for (let k of keys) {
		let v = o[k];
		if (_.isPlainObject(v)) {
			if (hasPlainObject(v)) {
				if ('array' === v.type) o[k] = new Rule(forgify(v));
				else o[k] = new Validator(forgify(v));
			} else {
				if (v.type) o[k] = new Rule(v);
				else o[k] = new Validator(v);
			}
		} else {
			if ('boolean' === v) o[k] = new Rule(v);
		}
	}
	o = _.pick(o, keys);
	return o;
};

module.exports = (sails) => ({
	initialize: (done) => {
		sails.after(['hook:moduleloader:loaded'], () => {
			_.each(sails.models, (model) => {
				if (!model.globalId || !model.nested) return;

				let rules = forgify(nested);

				// TODO: Override beforeCreate and beforeUpdate
				// TODO: to parse given attributes and apply rules of the same key.
			});

			done();
		});
	}
});
