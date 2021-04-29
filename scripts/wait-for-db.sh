#!/usr/bin/env bash

source .env
./scripts/wait-for-it.sh $POSTGRES_HOST:5432