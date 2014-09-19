angular.module('serialization', [])
    .constant('normalizedDeserializer', function (data) {
        var dependencies = data.dependencies;

        return {
            headers: data.headers,
            data: deserializePayload(data.payload)
        };

        function deserializePayload(payload) {
            if (_.isArray(payload)) {
                return _.map(payload, deserializePayload);
            }

            if (_.isPlainObject(payload)) {
                var deserializedObject = _.reduce(payload, function (result, propertyValue, propertyName) {
                    var propertyIsReference = _.isPlainObject(propertyValue) && getPropertyValue(propertyValue, '_shape') === 'reference';

                    result[propertyName] = propertyIsReference ? deserializeReference(propertyValue) : deserializePayload(propertyValue);

                    return result;
                }, {});

                return _.omit(deserializedObject, ['_type', '_shape']);
            }

            return payload;
        }

        function deserializeReference(serializedObject) {
            var type = getPropertyValue(serializedObject, '_type'),
                id = getPropertyValue(serializedObject, '_dependencyId'),
                objectsOfType = dependencies[type],
                referencedObject = objectsOfType && _.isPlainObject(objectsOfType) && objectsOfType[id];

            if (!referencedObject) {
                throw new Error('Object of type: "' + type + '" with id: "' + id + '" not found in: "' + JSON.stringify(dependencies) + '".');
            }

            return _.omit(deserializePayload(referencedObject), ['_type', '_dependencyId']);
        }

        function getPropertyValue(serializedObject, propertyName) {
            var attributeValue = serializedObject[propertyName];

            if (!attributeValue) {
                throw new Error('Error deserializing object: "' + JSON.stringify(serializedObject) + '", no attribute: "' + propertyName + '" specified.');
            }

            return attributeValue;
        }
    })
    .config(function ($httpProvider, normalizedDeserializer) {
        $httpProvider.defaults.transformResponse.push(deserializeResponse);

        function deserializeResponse(data) {
            var deserializer = getDeserializer(data);

            return deserializer(data);
        }

        function getDeserializer(data) {
            var deserializers = {
                    normalized: normalizedDeserializer
                },
                deserializer = _.isPlainObject(data) && data._type === 'Result' ? deserializers[data.format] : _.identity;

            if (!deserializer) {
                throw new Error('No deserializer could be found for format: "' + data.format + '".');
            }

            return deserializer;
        }
    });
