import { MyPromise } from './my-promise'

// new MyPromise((resolve, reject) => {
//   resolve(1)
//   console.log(1)
// })

// setTimeout(function() {
//   console.log('1')
// })

// new Promise(function(resolve) {
//   console.log('2')
//   resolve()
// }).then(function() {
//   console.log('3')
// })

// console.log('4')

// 2 4 3 1

const p1 = Promise.resolve(undefined)
const p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve()
    console.log(2)
  })
})
const p3 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve()
    console.log(3)
  })
})

p1.then(() => p2).then(() => p3)
