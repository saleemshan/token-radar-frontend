// import { getUppercaseFirstLetter } from '@/utils/string';
// import React from 'react';
// import SafetyMetric from '../SafetyMetric';
// import { Doughnut } from 'react-chartjs-2';
// import { Chart, ArcElement } from 'chart.js';

// Chart.register(ArcElement);
// const SecurityTab = () => {
//   return (
//     <div className=" min-h-[60vh] xl:max-h-[60vh] overflow-y-auto flex flex-col p-3 gap-3">
//       <div className="flex flex-col xl:flex-row gap-3">
//         <div className="border-border border p-3 rounded-lg min-w-80  overflow-hidden">
//           <div className=" font-semibold text-base">Score</div>
//           <div className="flex flex-col justify-center items-center relative text-white ">
//             <Doughnut
//               data={{
//                 datasets: [
//                   {
//                     data: [
//                       securityResponse.score,
//                       100 - securityResponse.score,
//                     ],
//                     backgroundColor: ['#2563eb', '#000000'],
//                     borderColor: '#2F2F2F',
//                     borderWidth: 1,
//                   },
//                 ],
//               }}
//               options={{
//                 plugins: {
//                   legend: {
//                     display: false,
//                   },
//                   tooltip: {
//                     enabled: false,
//                   },
//                 },
//                 rotation: -90,
//                 circumference: 180,
//                 cutout: '80%',
//                 maintainAspectRatio: true,
//                 responsive: true,
//               }}
//             />

//             <div className="absolute bottom-1/3 font-semibold text-lg">
//               {securityResponse.score} / 100
//             </div>
//           </div>
//         </div>
//         <div className="flex gap-2 flex-col text-base">
//           <div className="text-base font-semibold">
//             Popcat Security Analysis
//           </div>
//           <div>{securityResponse.descritpion}</div>
//         </div>
//       </div>

//       <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 pb-3">
//         {securityResponse.metrics &&
//           securityResponse.metrics.length > 0 &&
//           securityResponse.metrics.map((metric) => {
//             return (
//               <SafetyMetric
//                 key={metric.name}
//                 name={getUppercaseFirstLetter(metric.name)}
//                 pass={metric.pass}
//                 tooltip={metric.tooltip}
//                 value={metric.value}
//               />
//             );
//           })}
//       </div>
//     </div>
//   );
// };

// export default SecurityTab;
