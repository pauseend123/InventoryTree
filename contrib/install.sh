#!/usr/bin/env bash
# This script was generated by bashly 0.8.9 (https://bashly.dannyb.co)
# Modifying it manually is not recommended

if [[ "${BASH_VERSINFO:-0}" -lt 4 ]]; then
  printf "bash version 4 or higher is required\n" >&2
  exit 1
fi

root_command() {
  # Settings
  source_url=${args[source]}
  publisher=${args[publisher]}
  # Flags
  no_call=${args[--no-call]}
  dry_run=${args[--dry-run]}

  REQS="wget apt-transport-https"

  function do_call() {
      if [[ $dry_run ]]; then
          echo -e "### DRY RUN: \n$1"
      else
          $1
      fi
  }

  function get_distribution {
      if [ -f /etc/os-release ]; then
          . /etc/os-release
          OS=$NAME
          VER=$VERSION_ID
      elif type lsb_release >/dev/null 2>&1; then
          OS=$(lsb_release -si)
          VER=$(lsb_release -sr)
      elif [ -f /etc/lsb-release ]; then
          . /etc/lsb-release
          OS=$DISTRIB_ID
          VER=$DISTRIB_RELEASE
      elif [ -f /etc/debian_version ]; then
          OS=Debian
          VER=$(cat /etc/debian_version)
      elif [ -f /etc/SuSe-release ]; then
          OS=SEL
      elif [ -f /etc/redhat-release ]; then
          OS=RedHat
      else
          OS=$(uname -s)
          VER=$(uname -r)
      fi
  }

  echo "### Installer for InvenTree - source: $publisher/$source_url"

  # Check if os and version is supported
  get_distribution
  echo "### Detected distribution: $OS $VER"
  SUPPORTED=true
  case "$OS" in
      Ubuntu)
          if [[ $VER != "20.04" ]]; then
              SUPPORTED=false
          fi
          ;;
      Debian | Raspbian)
          if [[ $VER != "11" ]]; then
              SUPPORTED=false
          fi
          ;;
      *)
          echo "### Distribution not supported"
          SUPPORTED=false
          ;;
  esac

  if [[ $SUPPORTED != "true" ]]; then
      echo "This OS is currently not supported"
      echo "please install manually using https://inventree.readthedocs.io/en/stable/start/install/"
      echo "or check https://github.com/inventree/InvenTree/issues/3836 for packaging for your OS."
      echo "If you think this is a bug please file an issue at"
      echo "https://github.com/inventree/InvenTree/issues/new?template=install.yaml"

      exit 1
  fi

  echo "### Installing required packages for download"
  for pkg in $REQS; do
      if dpkg-query -W -f'${Status}' "$pkg" 2>/dev/null | grep -q "ok installed"; then
          true
      else
          do_call "sudo apt-get -yqq install $pkg"
      fi
  done

  echo "### Adding key and package source"
  # Add key
  do_call "wget -qO- https://dl.packager.io/srv/$publisher/InvenTree/key | sudo apt-key add -"
  # Add packagelist
  do_call "sudo wget -O /etc/apt/sources.list.d/inventree.list https://dl.packager.io/srv/$publisher/InvenTree/$source_url/installer/${lsb_dist}/${dist_version}.repo"

  echo "### Updateing package lists"
  do_call "sudo apt-get update"

  # Set up environment for install
  echo "### Setting installer args"
  if [[ $no_call ]]; then
      do_call "export NO_CALL=true"
  fi

  echo "### Installing InvenTree"
  do_call "sudo apt-get install inventree -y"

  echo "### Install done!"

}

version_command() {
  echo "$version"
}

install.sh_usage() {
  if [[ -n $long_usage ]]; then
    printf "install.sh - Interactive installer for InvenTree\n"
    echo

  else
    printf "install.sh - Interactive installer for InvenTree\n"
    echo

  fi

  printf "Usage:\n"
  printf "  install.sh [SOURCE] [PUBLISHER] [OPTIONS]\n"
  printf "  install.sh --help | -h\n"
  printf "  install.sh --version | -v\n"
  echo

  if [[ -n $long_usage ]]; then
    printf "Options:\n"

    echo "  --help, -h"
    printf "    Show this help\n"
    echo
    echo "  --version, -v"
    printf "    Show version number\n"
    echo

    echo "  --no-call, -n"
    printf "    Do not call outside APIs (only functionally needed)\n"
    echo

    echo "  --dry-run, -d"
    printf "    Dry run (do not install anything)\n"
    echo

    printf "Arguments:\n"

    echo "  SOURCE"
    printf "    Package source that should be used\n"
    printf "    Allowed: stable, master, main\n"
    printf "    Default: stable\n"
    echo

    echo "  PUBLISHER"
    printf "    Publisher that should be used\n"
    printf "    Default: inventree\n"
    echo

    printf "Examples:\n"
    printf "  install\n"
    printf "  install master --no-call\n"
    printf "  install master matmair --dry-run\n"
    echo

  fi
}

normalize_input() {
  local arg flags

  while [[ $# -gt 0 ]]; do
    arg="$1"
    if [[ $arg =~ ^(--[a-zA-Z0-9_\-]+)=(.+)$ ]]; then
      input+=("${BASH_REMATCH[1]}")
      input+=("${BASH_REMATCH[2]}")
    elif [[ $arg =~ ^(-[a-zA-Z0-9])=(.+)$ ]]; then
      input+=("${BASH_REMATCH[1]}")
      input+=("${BASH_REMATCH[2]}")
    elif [[ $arg =~ ^-([a-zA-Z0-9][a-zA-Z0-9]+)$ ]]; then
      flags="${BASH_REMATCH[1]}"
      for (( i=0 ; i < ${#flags} ; i++ )); do
        input+=("-${flags:i:1}")
      done
    else
      input+=("$arg")
    fi

    shift
  done
}

inspect_args() {
  readarray -t sorted_keys < <(printf '%s\n' "${!args[@]}" | sort)
  if (( ${#args[@]} )); then
    echo args:
    for k in "${sorted_keys[@]}"; do echo "- \${args[$k]} = ${args[$k]}"; done
  else
    echo args: none
  fi

  if (( ${#other_args[@]} )); then
    echo
    echo other_args:
    echo "- \${other_args[*]} = ${other_args[*]}"
    for i in "${!other_args[@]}"; do
      echo "- \${other_args[$i]} = ${other_args[$i]}"
    done
  fi
}

parse_requirements() {

  case "${1:-}" in
  --version | -v )
    version_command
    exit
    ;;

  --help | -h )
    long_usage=yes
    install.sh_usage
    exit
    ;;

  esac

  action="root"

  while [[ $# -gt 0 ]]; do
    key="$1"
    case "$key" in

    --no-call | -n )

      args[--no-call]=1
      shift
      ;;

    --dry-run | -d )

      args[--dry-run]=1
      shift
      ;;

    -?* )
      printf "invalid option: %s\n" "$key" >&2
      exit 1
      ;;

    * )

      if [[ -z ${args[source]+x} ]]; then

        args[source]=$1
        shift
      elif [[ -z ${args[publisher]+x} ]]; then

        args[publisher]=$1
        shift
      else
        printf "invalid argument: %s\n" "$key" >&2
        exit 1
      fi

      ;;

    esac
  done

  [[ -n ${args[source]:-} ]] || args[source]="stable"
  [[ -n ${args[publisher]:-} ]] || args[publisher]="inventree"

  if [[ ! ${args[source]} =~ ^(stable|master|main)$ ]]; then
    printf "%s\n" "source must be one of: stable, master, main" >&2
    exit 1
  fi

}

initialize() {
  version="2.0"
  long_usage=''
  set -e


}

run() {
  declare -A args=()
  declare -a other_args=()
  declare -a input=()
  normalize_input "$@"
  parse_requirements "${input[@]}"

  if [[ $action == "root" ]]; then
    root_command
  fi
}

initialize
run "$@"
