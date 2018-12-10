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

let carryOn = (values, proceed, previous) => _.isFunction(previous) ? previous(values, proceed) : proceed();

module.exports = function (sails) {
	return {
		initialize: function (cb) {
			sails.on(['hook:orm:loaded'], function () {
				_.each(sails.models, (model) => {
					if (!model.globalId || !model.nested) return;

					let rules = forgify(model.nested);
					delete model.nested;
					let nestedValidation = function (values, proceed, previous) {
						let errors = [];
						let keys = _.keys(values);
						_.each(keys, (key) => {
							let v = rules[key];
							let value = values[key];
							if (v && value && !v.test(value)) errors.push('Failed validation for ' + key + '.');
						});

						if (!_.isEmpty(errors)) return proceed(_.join(errors, ', '));
						return carryOn(values, proceed, previous);
					};

					let previousBeforeUpdate = model.beforeUpdate;
					model.beforeUpdate = function (values, proceed) {
						console.log("nested::beforeUpdate", values);
						return nestedValidation(values, proceed, previousBeforeUpdate);
					};

					let previousBeforeCreate = model.beforeCreate;
					model.beforeCreate = function (values, proceed) {
						console.log("nested::beforeCreate", values);
						return nestedValidation(values, proceed, previousBeforeCreate);
					};
					console.log('ok');
				});

				cb();
			});
		}
	}
};
