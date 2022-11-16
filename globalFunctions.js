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

export {
    getCheckedBtn,
    bundleTogetherCategory,
    deserializeList
}