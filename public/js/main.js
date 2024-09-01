
const inputSearch = $('.nav-search');

const test = $('.test');

async function getData(query) {
    const url = new URL("https://openlibrary.org/search.json");

    const params = new URLSearchParams({ 
        q: query.replace(/ /g, '+'),
        limit: 5, //Số lượng kết quả trả về
        offset: 0 
    });
    url.search = params.toString();

    console.log(url);

    try {
        const response = await fetch(url);
        
        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        return json;
    }  
    catch (err) {
        console.error(err.message)
    }
}

inputSearch.keyup(async function (event) {
    let value = inputSearch.val();
    let query = value;

    const searchList = $('.search-list');

    if (inputSearch.val() !== "") {

        searchList.prop('hidden', false);
        if (event.keyCode === 13) {
            const datas = await getData(query);
            console.log(datas);

            if (datas && datas.docs) {
                const htmlContent = datas.docs.map((doc, index) => {
                    // if (index <= 4) {
                    // }
                    return `<li class="list-group-item d-flex">
                    <img src="https://covers.openlibrary.org/b/id/${doc.cover_i}-S.jpg" alt="" class="item-img">

                    <div class="item-desc ps-3">
                    <p class="fs-6 fw-bold m-0">${doc.title}</p>
                    <p class="fs-6 fw-light">${doc.author_name ? doc.author_name[0] : ""}</p>
                    </div>
                    </li>`
                }).join('');

                searchList.html(htmlContent);
            }
            else {
                searchList.html('<li class="list-group-item">Cannot find book, Try again...</li>')
            }
        }
    }
    else {
        searchList.prop('hidden', true);
    }
})