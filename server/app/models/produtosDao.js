import {client,db} from '../../database/dbConnection.js'

const collection = client.db(db).collection('produtos')

//Retorna produtos ordenados de acordo com o campo definido em orderBy
//e ordenados na ordem definida por reverse, se verdadeiro ordem reversa (ASC)
const getAllProdutos = async (orderBy='id_prod', reverse = false) => {
    try {
        console.log('getAllProdutos')
        let resultados = []

        resultados = collection.find({}, {
            sort: {[orderBy]: reverse ? -1 : 1}
        }).toArray()
        
        return resultados;
    } catch (error) {
        console.log(error)
        return false;
    }
}

//Busca produto definido por id_prod igual ao campo id_prod
const getProdutoById = async (id_prod) => {
    try {
        let produto = {}

        const filtro = {
            "id_prod":{$eq:Number(id_prod)}
            
        }
        produto = await collection.find(filtro).toArray()
        
        return produto;
    } catch (error) {
        console.log(error)
        return false;
    }
}

//Registra um novo produto no banco, 
//retorna verdadeiro se inserido com sucesso
//API - Testar com cliente HTTP
const insertProduto = async (produto) => {
    try {
        //console.log(produto.preco)
        produto.id_prod = Number(produto.id_prod)
        produto.qtd_estoque = Number(produto.qtd_estoque)
        produto.preco = Number(produto.preco)
        produto.desconto = Number(produto.desconto)
        await collection.insertOne(produto)
        
        return true 
    } catch (error) {
        console.log(error)
        return false;
    }
}

//Atualiza um produto no banco
//retorna verdadeiro se atualizado com sucesso
//API - Testar com cliente HTTP
const updateProduto = async (new_produto) => {
    try {
        //console.log('Objetao' + '=>' + new_produto.id_prod)
        let data = {$set: new_produto}
        let id_update = {id_prod: Number(new_produto.id_prod)}
        
        let updated = await collection.updateOne(id_update, data)
        if (updated) return true
        else throw new Error('DAO: Erro ao atualizar produto!')
    } catch (error) {
        console.log(error)
        return false;
    }
}

//Remove um produto do banco
//API - Testar com cliente HTTP
const deleteProduto = async (id_prod) => {
    try {
       
        let filter = {id_prod: Number(id_prod)}
        const deleted = await collection.deleteOne(filter)
        
        return deleted //boolean
    } catch (error) {
        console.log(error)
        return false;
    }
}

//API - Testar com cliente HTTP
const deleteManyProdutos = async (ids) => {
    try {
        console.log('IDs many' + '=>' + ids)
        let deltedAll = collection.deleteMany({id_prod: {$in: ids}})

        return deltedAll //boolean
    } catch (error) {
        console.log(error)
        return false;
    }
}

const getFiltredProdutos = async (field = 'nome', term = '') => {
    try {
        let resultados=[]
        console.log({ field, term })
        await changeIndexes(field) //troca de indices
  
        resultados = await collection.find({
            $text: {
                $search: term
            }
        }).toArray()
        
        return resultados;
    } catch (error) {
        console.log(error)
        return false;
    }
}

const getProdutosPriceRange = async (greater = 0, less = 0, sort = 1) => {
    try {
        let resultados = []
        
        resultados = await collection.find({preco:{$gt:greater, $lt:less}}, {sort:{preco:sort}}).toArray()
        
        return resultados;
    } catch (error) {
        console.log(error)
        return false;
    }
}

const changeIndexes = async (field) => {

    const indexes = await collection.indexes()
    const textIndexes = indexes.filter(index => index.key?._fts === 'text')
   
    textIndexes.forEach(async index =>{ 
        if(index.name !== field + '_text')
            await collection.dropIndex(index.name)
    })

    if(!textIndexes.length){
        let newIndex = {}
        newIndex[field] = 'text' //field = 'nome' => {nome:'text'}
        collection.createIndex(newIndex)
    }
}

export {
    getAllProdutos,
    getProdutoById,
    insertProduto,
    updateProduto,
    deleteProduto,
    deleteManyProdutos,
    getFiltredProdutos,
    getProdutosPriceRange
}