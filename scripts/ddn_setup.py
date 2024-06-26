import argparse
import subprocess
import shutil
import psycopg2
import sys
import os
import pathlib
import yaml
import time

SUBGRAPH_NAME = 'default'
CONNECTOR_NAME = 'pg'
CONNECTOR_PATH = f'{SUBGRAPH_NAME}/connector/{CONNECTOR_NAME}'
CONNECTOR_PORT = 8082
CONNECTOR_DOCKER_COMPOSE_PATH = f'{
    CONNECTOR_PATH}/docker-compose.{CONNECTOR_NAME}.yaml'
HASURA_DOCKER_COMPOSE_PATH = 'docker-compose.hasura.yaml'

def sh(cmd):
    print()
    print(cmd)
    subprocess.run(f'{cmd}', shell=True).check_returncode()


def update_hasura_docker_compose():
    with open(HASURA_DOCKER_COMPOSE_PATH, 'r') as file:
        data = yaml.safe_load(file)

    # Add include for python
    data.setdefault('include', []).append(
        {'path': CONNECTOR_DOCKER_COMPOSE_PATH})

    with open(HASURA_DOCKER_COMPOSE_PATH, 'w') as file:
        yaml.dump(data, file)


def update_connector_docker_compose():
    with open(CONNECTOR_DOCKER_COMPOSE_PATH, 'r') as file:
        data = yaml.safe_load(file)

    data['services'][f'{SUBGRAPH_NAME}_{CONNECTOR_NAME}']['ports'][0]['published'] = str(CONNECTOR_PORT)

    with open(CONNECTOR_DOCKER_COMPOSE_PATH, 'w') as file:
        yaml.dump(data, file)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dir', type=str, required=True)
    parser.add_argument('-c', '--connection-string', type=str, required=True)
    parser.add_argument('--login', type=bool, default=True,
                        action=argparse.BooleanOptionalAction)
    args = parser.parse_args()

    # Replace localhost in connection string with local.hasura.dev so that
    # we can point it to the host machine from within the docker container.
    connection_string = args.connection_string.replace(
        'localhost', 'local.hasura.dev').replace('127.0.0.1', 'local.hasura.dev')

    print(f"Changing working directory to {args.dir}")
    pathlib.Path(args.dir).mkdir(parents=True, exist_ok=True)
    os.chdir(args.dir)

    try:
        psycopg2.connect(connection_string)
    except Exception as e:
        print(f'Could not connect to database: {e}', file=sys.stderr)
        exit(1)

    # Install DDN CLI if needed
    if shutil.which('ddn') is None:
        sh('curl -L http://graphql-engine-cdn.hasura.io/ddn/cli/v2/get.sh | sh')

    if args.login:
        sh('ddn auth login')

    sh('ddn supergraph init --dir .')
    sh('ddn context set supergraph ./supergraph.yaml')
    sh(f'ddn subgraph init {SUBGRAPH_NAME}')
    sh(f'ddn connector init {CONNECTOR_NAME} --subgraph {SUBGRAPH_NAME} --hub-connector hasura/postgres')
    with open(f'{CONNECTOR_PATH}/.env.local', 'a') as file:
        file.write(f'\nCONNECTION_URI={connection_string}')
    sh(f'ddn connector introspect --connector {CONNECTOR_PATH}/connector.yaml')
    update_connector_docker_compose()
    sh(f'ddn connector-link add {CONNECTOR_NAME} --subgraph {SUBGRAPH_NAME}')
    with open(f'{SUBGRAPH_NAME}/.env.{SUBGRAPH_NAME}', 'w') as file:
        file.writelines([
            f'{SUBGRAPH_NAME.upper()}_{CONNECTOR_NAME.upper(
            )}_READ_URL=http://local.hasura.dev:{CONNECTOR_PORT}',
            '\n',
            f'{SUBGRAPH_NAME.upper()}_{CONNECTOR_NAME.upper(
            )}_WRITE_URL=http://local.hasura.dev:{CONNECTOR_PORT}'
        ])
    sh(f'docker compose -f {CONNECTOR_DOCKER_COMPOSE_PATH} up -d')
    # Wait 10 seconds for container to start
    time.sleep(10)
    sh(f'ddn connector-link update {CONNECTOR_NAME} --subgraph {SUBGRAPH_NAME} --add-all-resources')
    sh(f'docker compose -f {CONNECTOR_DOCKER_COMPOSE_PATH} down')
    update_hasura_docker_compose()
    sh(f'ddn supergraph build local --output-dir ./engine')
    with open('engine/.env.engine', 'a') as file:
        file.write(f'\nENABLE_SQL_INTERFACE=true')


if __name__ == '__main__':
    main()
