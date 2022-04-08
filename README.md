# GPM - Git Project Manager

[![NPM version](https://img.shields.io/npm/v/@cliz/gpm.svg?style=flat)](https://www.npmjs.com/package/@cliz/gpm)
[![Build Status](https://github.com/zcorky/gpm/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/zcorky/gpm/actions/workflows/ci.yml)
[![NPM download](https://img.shields.io/npm/dm/@cliz/gpm.svg?style=flat-square)](https://www.npmjs.com/package/@cliz/gpm)
![license](https://img.shields.io/github/license/zcorky/gpm.svg)
[![issues](https://img.shields.io/github/issues/zcorky/gpm.svg)](https://github.com/zcorky/gpm/issues)

Git Package Manager, make you manage and develop projects easily.

## Usage

```bash
gpm 1.2.4 — Git Project Manager

USAGE 

   ▸ gpm <command> [ARGUMENTS...] [OPTIONS...]


COMMANDS — Type 'gpm help <command>' to get some help about a command

   add                                  Add an project                                         
   bootstrap                            Project Bootstrap                                      
   build                                Project Build                                          
   clean                                Project Clean                                          
   cli                                  Project CLI                                            
   commit                               Project Commit                                         
   dev                                  Project Dev                                            
   fmt                                  Project Fmt                                            
   github                               Project GitHub Open                                    
   info                                 Get gpm info                                           
   install                              Project Install Dependencies                           
   new                                  Create an project                                      
   open                                 Project Finder Open                                    
   proxy                                Run command in proxy                                   
   release                              Project Install Dependencies                           
   remove                               Remove a project                                       
   run                                  Project Run                                            
   search                               Search a project                                       
   serve                                Project Serve, alias of Run                            
   share terminal                       Share terminal                                         
   share web                            Share Web Service                                      
   sync                                 Sync a project                                         
   terminal                             Share terminal                                         
   test                                 Project Test                                           
   vscode                               Project VSCode Open                                    
   watch                                Project Watch                                          

GLOBAL OPTIONS

   -h, --help                           Display global help or command-related help.           
   -V, --version                        Display version.                                       
   --no-color                           Disable use of colors in output.                       
   -v, --verbose                        Verbose mode: will also output debug messages.         
   --quiet                              Quiet mode - only displays warn and error messages.    
   --silent                             Silent mode: does not output anything, giving no       
                                       indication of success or failure other than the exit   
                                       code.    
```

## Features

### Project Manager
- [x] add project
- [x] create project
- [x] remove project
- [x] sync project
- [x] search project

### Devtools Manager
- [x] bootstrap
- [x] dev
- [x] build
- [x] test
- [x] commit
- [x] fmt
- [x] clean
- [x] run
- [x] watch

### Package Manager
- [x] publish
- [ ] create package from template

### Share Manager
- [x] share terminal
- [x] share web app

### Others
- [x] info     => get system info
- [x] proxy    => run commit with proxy
- [x] vscode   => open in VSCode
- [x] github   => open in GitHub
- [x] open     => open in Finder

## Installation
```bash
npm i -g @cliz/gpm
```

## Example

```bash
# add a project
gpm add https://github.com/zcorky/gpm.git

# dev a project
gpm dev

# build a project
gpm build

# format a project
gpm fmt

# test a project
gpm test
```
## License

The [MIT License](./LICENSE)
