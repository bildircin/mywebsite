function getCheckedBtn(item) {  
    if(item == 'on'){
        return true
    }else{
        return false
    }
}

async function bundleTogetherCategory(categories){
    let geciciDizi = []

    await categories.forEach(item => {  // parentid ye sahip olanları gecici dizide parentid olusturup içine ekedik
        if (item.parentId == 0)
        return
        
        if (geciciDizi[ item.parentId ] === undefined)
        geciciDizi[ item.parentId ] = []
        
        geciciDizi[ item.parentId ].push(item)
    })
    
    await categories.forEach(item => {
        if (item.id == 0)
            return

        if (geciciDizi[ item.id ] === undefined)  // gecici dizide yoksa bu en tepede bir parenttır yani parent id si 0 dır
            return

        item["children"] = geciciDizi[ item.id ] // degerini gecici diziden alıp içine ekleyeim
    })

    let ret = []

    await categories.forEach(item => { // son olarak en tepe parent ları ret e ekleyelim
        if (item.parentId !== 0)
            return

        ret.push(item)
    })

    return ret
}

function deserializeList(arr, id) {
    let result = []

    for(let i = 0; i < arr.length; i++){
        if(arr[i].hasOwnProperty('children')){
            result.push({
                id:arr[i].id,
                parentId:id,
                has:true
            })
            result = result.concat(deserializeList(arr[i].children, arr[i].id))
        }else{
            result.push({
                id:arr[i].id,
                parentId:id,
                has:false
            })
        }
    }
    return result
}

function serializeList(arr){
    let geciciDizi = []

    arr.forEach(item => {  // parentid ye sahip olanları gecici dizide parentid olusturup içine ekedik
        if (item.parentId == 0)
        return
        
        if (geciciDizi[ item.parentId ] === undefined)
        geciciDizi[ item.parentId ] = []
        
        geciciDizi[ item.parentId ].push(item)
    })
    
    arr.forEach(item => {
        if (item.id == 0)
            return

        if (geciciDizi[ item.id ] === undefined)  // gecici dizide yoksa bu en tepede bir parenttır yani parent id si 0 dır
            return

        item["children"] = geciciDizi[ item.id ] // degerini gecici diziden alıp içine ekleyeim
    })

    let ret = []

    arr.forEach(item => { // son olarak en tepe parent ları ret e ekleyelim
        if (item.parentId !== 0)
            return

        ret.push(item)
    })

    //sıralamak için
    arr.forEach(item =>{
        isChildren(item)
    })
    sirala(ret)

    return ret
}

function isChildren(item){
    if(item.children){
        for (let i = 0; i < item.children.length; i++) {
            isChildren(item.children[i])
        }
        sirala(item.children)
    }
}

function sirala(arr){
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - 1; j++) {
            if(arr[j].sequence > arr[j + 1].sequence){
                let temp = arr[j]
                arr[j] = arr[j + 1]
                arr[j + 1] = temp
            }
        }
    }
}

function dhm (ms) {
    const days = Math.floor(ms / (24*60*60*1000));
    const daysms = ms % (24*60*60*1000);
    const hours = Math.floor(daysms / (60*60*1000));
    const hoursms = ms % (60*60*1000);
    const minutes = Math.floor(hoursms / (60*1000));
    const minutesms = ms % (60*1000);
    const sec = Math.floor(minutesms / 1000);
    return {days, hours, minutes, sec};
  }

export {
    getCheckedBtn,
    bundleTogetherCategory,
    deserializeList,
    serializeList,
    dhm
}