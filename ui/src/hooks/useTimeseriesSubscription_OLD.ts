export {}; // supress lint

// import { useEffect, useRef, useState } from "react";
// import _ from "lodash";
// import { TablesBucket, Process, Table, subscribeTimeseries } from "../api";

// const withStartAndEndTimes = (start: number, end: number) => (
//   tableState: Table
// ) => ({
//   ...tableState,
//   start: tableState.start || start,
//   end,
// });

// interface TablesHashMap {
//   [key: string]: Table;
// }

// interface State {
//   tablesMap: TablesHashMap;
//   time: number;
// }

// export interface SubscriptionState {
//   tables: Table[];
//   startTime: number;
//   time: number;
// }

// export interface SubscriptionUpdaters {
//   setTimeframeStart: Function;
//   unsubscribe: Function;
// }

// export default function useTimeseriesSubscription(): [
//   SubscriptionState,
//   SubscriptionUpdaters
// ] {
//   //const connStart = useRef(0);
//   //const [tablesMap, setTables]: [{ [name: string]: Table }, Function] = useState({});
//   //const [time, setTime]: [number, Function] = useState(0);
//   const startTime = useRef(0);
//   const [state, setState]: [State, Function] = useState({
//     tablesMap: {},
//     time: 0,
//   });
//   const [timeframeStart, setTimeframeStart] = useState(startTime.current);

//   let unsubscribe = () => {};
//   useEffect(() => {
//     unsubscribe = subscribeTimeseries((bucket: TablesBucket) => {
//       let { t_start, t_end, table_states: tableStates } = bucket;
//       const start = new Date(t_start).getTime();
//       const end = new Date(t_end).getTime();

//       if (!startTime.current) {
//         startTime.current = start;
//       }

//       setState((prev: State) => ({
//         ...prev,
//         tablesMap: getUpdatedTablesMap(prev.tablesMap, tableStates, start, end),
//         time: end,
//       }));
//     });
//   }, []);

//   useEffect(() => {
//     // Every time timeframe changes, garbage collect
//     let tablesMap = {};
//     for (const [name, table] of _.toPairs(state.tablesMap)) {
//       const table = state.tablesMap[name];
//       if (table?.end < timeframeStart) {
//         // Table timespan not within timeframe anymore
//         continue;
//       }

//       tablesMap = {
//         ...tablesMap,
//         [name]: {
//           ...table,
//           // Only keep the processes still within timeframe
//           processes: table.processes.filter(
//             (process) => process.end >= timeframeStart
//           ),
//         },
//       };
//     }

//     setState((prev: State) => ({
//       ...prev,
//       tablesMap,
//     }));
//   }, [timeframeStart]);

//   const tables = Object.values(state.tablesMap).sort((table1, table2) =>
//     table1.name < table2.name ? -1 : 1
//   );

//   return [
//     {
//       tables,
//       startTime: startTime.current,
//       time: state.time,
//     },
//     {
//       setTimeframeStart,
//       unsubscribe,
//     },
//   ];
// }

// function getUpdatedTablesMap(
//   prevTablesMap: TablesHashMap,
//   tableStates: Table[],
//   start: number,
//   end: number
// ) {
//   let newTablesMap = {};
//   for (const tableState of tableStates) {
//     const prevTableState = prevTablesMap[tableState.name] || {};
//     let prevProcessesMap = _.keyBy(prevTableState.processes, "pid");
//     let newProcessesMap = _.keyBy(tableState.processes, "pid");
//     const allPids = _.union(
//       _.map(prevTableState.processes, "pid"),
//       _.map(tableState.processes, "pid")
//     );
//     let processes: Process[] = [];
//     for (const pid of allPids) {
//       if (prevProcessesMap[pid] && newProcessesMap[pid]) {
//         // Continuum
//         processes = [
//           ...processes,
//           {
//             ...prevProcessesMap[pid],
//             end: new Date(end).getTime(),
//           },
//         ];
//       } else if (prevProcessesMap[pid]) {
//         // Ended
//         processes = [...processes, prevProcessesMap[pid]];
//       } else if (newProcessesMap[pid]) {
//         // Newly enetered
//         processes = [
//           ...processes,
//           {
//             ...newProcessesMap[pid],
//             start: new Date(start).getTime(),
//             end: new Date(end).getTime(),
//           },
//         ];
//       }
//     }
//     const newTableState = {
//       ...prevTableState,
//       ...tableState,
//       processes,
//       start: prevTableState?.start || new Date(start).getTime(),
//       end: new Date(end).getTime(),
//     };
//     newTablesMap = {
//       ...newTablesMap,
//       [tableState.name]: newTableState,
//     };
//   }
//   return newTablesMap;
// }
