#!/bin/bash
if [ -f /.dockerenv ]; then
   echo "You can not start the development environment inside a docker container"
else
	DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
	pushd $DIR >/dev/null
	DOCKER_ARGS=""
	if [ "no-cache" = "$1" ];
	then
		DOCKER_ARGS="$DOCKER_ARGS --no-cache"
		if [ -e .env ];
		then
			source .env
		fi
		rm -rf ${MONGO_LOCAL_DATA:-~/.mongo_data/movDB}
	fi
	DOCKER_BUILDKIT=1 docker build $DOCKER_ARGS --pull -f Dockerfile.dev -t valawai/topology_editor:dev .
	if [ $? -eq 0 ]; then
		DOCKER_PARAMS="--rm --name topology_editor_dev --add-host=host.docker.internal:host-gateway -v /var/run/docker.sock:/var/run/docker.sock -p 4242:4200 -it"
		docker run $DOCKER_PARAMS  -v "${PWD}":/app valawai/topology_editor:dev /bin/bash
	fi
	popd >/dev/null
fi
