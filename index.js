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

let carryOn = (cb, values, previous) => _.isFunction(previous) ? previous(values, cb) : cb();

module.exports = (sails) => ({
	initialize: (cb) => {
		sails.after(['hook:moduleloader:loaded'], () => {
			_.each(sails.models, (model) => {
				if (!model.globalId || !model.nested) return;

				let rules = forgify(model.nested);
				let nestedValidation = async function (values, cb, previous) {
					let errors = [];
					let keys = _.keys(values);
					_.each(keys, (key) => {
						let v = rules[key];
						let value = values[key];
						if (v && value && !v.test(value)) errors.push('Failed validation for ' + key + '.');
					});

					if (!_.isEmpty(errors)) return cb(_.join(errors, ', '));
					return carryOn(cb, values, previous);
				};

				let previousBeforeUpdate = model.beforeUpdate;
				model.beforeUpdate = async function (values, cb) {
					return nestedValidation(values, cb, previousBeforeUpdate);
				};

				let previousBeforeCreate = model.beforeCreate;
				model.beforeCreate = async function (values, cb) {
					return nestedValidation(values, cb, previousBeforeCreate);
				};
			});

			cb();
		});
	}
});