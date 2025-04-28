#region imports
import json
import os
import random
import sys
import time
import uuid
from collections import OrderedDict, namedtuple
from itertools import chain, product
from string import Formatter

import matplotlib.pyplot as plt
import numpy as np
import yaml
from IPython.display import display_html, display_javascript

# import gsm
import gsm
from examples.catan.main import Catan
from examples.tictactoe import TicTacToe
# from examples.tictactoe.main import TicTacToe
from gsm import (Array, GameLogger, GameObject, tdeque, tdict, tlist, tset,
                 tstack, viz)
from gsm.common.world import grid
from gsm.core.actions import decode_action_set
from gsm.mixins import Named
from gsm.util import jsonify, unjsonify
from gsm import viz
from humpack import tdict, tlist, tset

np.set_printoptions(linewidth=120)
#endregion
#region string / type / yaml utilities
def strBefore(sFull, sSub):
	return sFull.partition(sSub)[0]

def strAfter(sFull, sSub):
	return sFull.partition(sSub)[2]

def isString(o):
	return isinstance(o, str)

def isGsmType(o):
	return 'gsm' in str(type(o))

def isPyObject(o):
	return not 'gsm' in str(type(o))

def _jString(x):
	if isGsmType(x):
		return json.dumps(jsonify(x))
	elif isPyObject(x):
		return json.dumps(x)
	else:
		return x

def _pyObject(x):
	if isString(x):
		return json.loads(x)
	elif isGsmType(x):
		return jsonify(x)
	else:
		return x

def _gsmObject(x):
	if isString(x):
		return unjsonify(json.loads(x))
	elif isPyObject(x):
		return unjsonify(x)
	else:
		return x

def ymlFile_jString(path):
	return json.dumps(yaml.load(open(path, 'r'), Loader=yaml.SafeLoader))

def ymlFile_pyObject(path):
	return yaml.load(open(path, 'r'), Loader=yaml.SafeLoader)

def userSpecYmlPath(game):
	rootPath = os.path.dirname(os.path.abspath(__file__))  #path of this file app_interface.py
	path = os.path.join(rootPath, 'examples_front_old/' + game + '/' + game + '_ui.yaml')
	print('***', game, path)
	return path

#endregion

#represents one (and only for now) game instance
class Game(object):
	def __init__(self, game='ttt', player=None, seed=1):
		self.I = None
		print('HOST INITIALIZED!')

	def startHost(self):
		self.I = viz.Ipython_Runner(r'http://localhost:5000/', 'me', 'other', full_log=True) #Ipython_Interface(Catan(), seed=seed)
		print('games:',self.I.available_games)
		self.I.restart()
	
	def setGame(self, game='ttt', seed=1):
		self.gameName = game
		self.I.select_game(game)

	def get_UI_spec(self, game='tictactoe'):
		return self.I.get_UI_spec(game)

	def augment(self):
		# tuplesX = self.I.actions
		msg = self.I.msg
		if 'options' in msg:
			tupleGroups = tlist()
			for opt in msg.options:
				tgroup = tdict()
				desc = opt.desc if 'desc' in opt else ''
				tgroup.desc = desc
				tgroup.tuples = decode_action_set(opt.actions)
				tupleGroups.append(tgroup)
			msg.tupleGroups = tupleGroups
		jmsg = jsonify(msg)
		jsmsg = _jString(jmsg)
		return jsmsg

	def init(self, game='ttt', player=None, seed=1):
		if self.I == None:
			self.startHost()
		self.I.restart()
		self.setGame(game, seed)
		print('players:',self.I.game_players)
		print(self.I.add_player('Player1'))
		self.I.set_user()
		print(self.I.add_player('Player2'))
		self.I.set_user()
		self.I.status()
		res = self.augment()
		return res

	def restart(self, player=None, seed=1):
		self.I.reset(seed=seed)
		self.I.view()
		res = self.augment()
		return res

	def move(self, player=None, ituple=None, seed=1):
		self.I.select_action(ituple)
		self.I.step()
		self.I.set_player()
		self.I.get_status()
		self.I.view()
		print(':::::', len(self.I.table))
		res = self.augment()
		return res

#endregion
