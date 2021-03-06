import Vue from "vue";
import Vuex from "vuex";
import Axios from "axios";
import router from "../router/index";
import AuthService from "../AuthService";

Vue.use(Vuex);

//Allows axios to work locally or live
let base = window.location.host.includes("localhost")
  ? "//localhost:3000/"
  : "/";

let api = Axios.create({
  baseURL: base + "api/",
  timeout: 3000,
  withCredentials: true
});

export default new Vuex.Store({
  //#region -- STATE --
  state: {
    user: {},
    posts: [],
    teams: [],
    notes: [],
    activePost: {},
    events: [],
    activeAdmin: {},
    players: [],
    activeTeamId: {}
  },
  //#endregion
  //#region -- MUTATIONS --
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setPosts(state, posts) {
      state.posts = posts;
    },
    resetState(state) {
      state.user = {};
      state.posts = [];
      state.activePost = {};
      state.events = [];
      state.players = [];
      state.notes = [];
      state.teams = [];
      state.activeTeamId = {};
    },
    addPost(state, post) {
      state.posts.push(post);
    },
    allPosts(state, data) {
      state.posts = data;
    },
    setEvents(state, events) {
      state.events = events;
    },
    putEvent(state, event) {
      state.events.push(event);
    },

    setTeams(state, teams) {
      state.teams = teams;
    },
    allPlayers(state, data) {
      state.players = data;
    },
    createPlayer(state, players) {
      state.players.push(players);
    },
    setActiveTeamId(state, teamId) {
      state.activeTeamId = teamId;
    }
    //#endregion
  },
  actions: {
    //#region -- AUTH STUFF --
    async register({ commit, dispatch }, creds) {
      try {
        let user = await AuthService.Register(creds);
        commit("setUser", user);
        router.push({ name: "login" });
      } catch (e) {
        console.warn(e.message);
      }
    },
    async login({ commit, dispatch }, creds) {
      try {
        let user = await AuthService.Login(creds);
        commit("setUser", user);
        router.push({ name: "boards" });
      } catch (e) {
        console.warn(e.message);
      }
    },
    async logout({ commit, dispatch }) {
      try {
        let success = await AuthService.Logout();
        if (!success) {
        }
        commit("resetState");
        router.push({ name: "login" });
      } catch (e) {
        console.warn(e.message);
      }
    },
    //#endregion

    //#region -- POSTS --
    async addPost({ commit, dispatch }, postData) {
      console.log(postData);
      let res = await api.post("posts", postData);
      commit("addPost", res.data);
    },
    async getPosts({ commit, dispatch }) {
      let res = await api.get("posts");
      commit("allPosts", res.data);
    },
    async getPostsByTeamId({ commit, dispatch }, teamId) {
      let res = await api.get("teams/" + teamId + "/posts");
      commit("allPosts", res.data);
    },
    async deletePost({ commit, dispatch }, postData) {
      let res = await api.delete(`posts/${postData._id}`);
      dispatch("getPostsByTeamId", postData.teamId);
    },

    async editPost({ commit, dispatch }, postData) {
      let res = await api.put("posts/" + postData.id, postData);
      dispatch("getPosts");
    },
    //#endregion

    //#region --EVENTS--
    async getEvents({ commit, dispatch }) {
      let res = await api.get("events");
      commit("setEvents", res.data);
    },
    async getEventsByTeamId({ commit, dispatch }, teamId) {
      let res = await api.get("teams/" + teamId + "/events");
      commit("setEvents", res.data);
    },
    async createEvent({ commit, dispatch }, eventData) {
      let res = await api.post("events", eventData);
      commit("putEvent", res.data);
    },
    async editEvent({ commit, dispatch }, eventData) {
      let res = await api.put("events/" + eventData._id, eventData);
      dispatch("getEvents");
    },
    async deleteEvent({ commit, dispatch }, eventId) {
      let res = await api.delete("events/" + eventId);
      dispatch("getEventsByTeamId", eventId);
    },
    //#endregion - events

    // #region TEAMS
    async getTeams({ commit, dispatch }) {
      let res = await api.get("teams");
      commit("setTeams", res.data);
    },
    async createTeam({ commit, dispatch }, teamData) {
      let res = await api.post("/teams", teamData);
      commit("setTeams", res.data);
      console.log(teamData);
    },
    async deleteTeam({ commit, dispatch }, teamId) {
      let res = await api.delete(`teams/${teamId}`);
      dispatch("getTeams");
    },
    // #endregion

    //#region PLAYERS
    async getPlayers({ commit, dispatch }) {
      let res = await api.get("players");
      commit("allPlayers", res.data);
      console.log("players in store", res.data);
    },
    async getPlayersByTeamId({ commit, dispatch }, teamId) {
      let res = await api.get("teams/" + teamId + "/players");
      commit("allPlayers", res.data);
    },
    async addPlayer({ commit, dispatch }, playerData) {
      let res = await api.post("players", playerData);
      commit("createPlayer", res.data);
      console.log(playerData);
    },
    async deletePlayer({ commit, dispatch }, playerId) {
      let res = await api.delete("players/" + playerId);
      dispatch("getPlayers");
    },
    async editPlayer({ commit, dispatch }, playerData) {
      let res = await api.put("players/" + playerData.id, playerData);
      dispatch("getPlayers");
    }
    //#endregion
  }
});
