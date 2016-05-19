#!/usr/bin/sh

SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")

for bench in "$SCRIPTPATH"/bench*.js
do
  echo $(basename "$bench") "$@"
  node "$bench" "$@" || exit $?
done
